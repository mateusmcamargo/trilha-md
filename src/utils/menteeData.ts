import { cache } from 'react';
import { redirect } from 'next/navigation';

import type { TrailNodeStatus } from '#/components/Trail/TrailNode';
import type { Database, Tables } from '#/types/database';

import { dayInSaoPaulo, todayInSaoPaulo, yesterdayInSaoPaulo } from './dates';
import { mockRows } from './mockData';
import { isMockMode } from './mockMode';
import { createClient } from './supabase/server';

type Functions = Database['public']['Functions'];

// remote and in-person activities of the trail, with how many items each remote one has
export type TrailActivity = Pick<Tables<'activities'>,
    'id' | 'title' | 'kind' | 'position' | 'parent_id' | 'starts_at' | 'ends_at'
> & { itemCount: number };

// answered: items already answered in this attempt
export type TrailAttempt = Pick<Tables<'attempts'>,
    'activity_id' | 'finished_at' | 'correct_count' | 'total_count'
> & { answered: number };

export interface MenteeRows {
    profile: Tables<'profiles'>;
    email: string;
    emailVerified: boolean;
    userStats: Tables<'user_stats'>;
    enrollments: (Tables<'enrollments'> & { editions: Tables<'editions'> })[];
    activities: TrailActivity[]; // current edition
    attempts: TrailAttempt[];
    attendedIds: string[]; // in-person activities with presence
    xpEntries: Pick<Tables<'xp_entries'>, 'edition_id' | 'xp'>[]; // every trail
    signedCertificates: number;
    mentors: Functions['list_mentors']['Returns'];
    friends: Functions['list_friends']['Returns'];
}

export type EventStatus = 'upcoming' | 'today' | 'attended' | 'missed';

export interface TrailBranch {
    id: string;
    title: string;
    startsAt: string;
    status: EventStatus;
}

export interface TrailItem {
    id: string;
    title: string;
    status: TrailNodeStatus;
    progress: number;
    branches: TrailBranch[];
}

function sumXp(rows: MenteeRows['xpEntries']) {
    return rows.reduce((total, row) => total + (row.xp ?? 0), 0);
}

export function eventStatus(startsAt: string, attended: boolean): EventStatus {
    if (attended) return 'attended';
    const day = dayInSaoPaulo(startsAt);
    const today = todayInSaoPaulo();
    return day === today ? 'today' : day > today ? 'upcoming' : 'missed';
}

// shared with the mentor's view of the mentee's trail (dashboardData.ts)
// main path: remote activities; in-person ones hang beside their parent (branches)
export function buildTrail(
    activities: TrailActivity[],
    attempts: TrailAttempt[],
    attendedIds: Set<string>,
) {
    const remotes = activities
        .filter((activity) => activity.kind === 'remota')
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

    const branchesOf = (parentId: string): TrailBranch[] => activities
        .filter((activity) => activity.kind === 'presencial' && activity.parent_id === parentId && activity.starts_at)
        .sort((a, b) => a.starts_at!.localeCompare(b.starts_at!))
        .map((activity) => ({
            id: activity.id,
            title: activity.title,
            startsAt: activity.starts_at!,
            status: eventStatus(activity.starts_at!, attendedIds.has(activity.id)),
        }));

    let availableFound = false;

    const trailItems: TrailItem[] = remotes.map((activity) => {
        const own = attempts.filter((attempt) => attempt.activity_id === activity.id);
        const finished = own.filter((attempt) => attempt.finished_at);
        const open = own.find((attempt) => !attempt.finished_at);
        const base = { id: activity.id, title: activity.title, branches: branchesOf(activity.id) };

        if (finished.length) {
            const mastered = finished.some((attempt) =>
                !!attempt.total_count && attempt.correct_count === attempt.total_count);
            return { ...base, status: mastered ? 'gold' : 'completed', progress: 100 };
        }

        if (!availableFound) {
            availableFound = true;
            const progress = open && activity.itemCount
                ? Math.round((open.answered / activity.itemCount) * 100)
                : 0;
            return { ...base, status: 'available', progress };
        }

        return { ...base, status: 'locked', progress: 0 };
    });

    const completed = trailItems.filter(
        (item) => item.status === 'completed' || item.status === 'gold'
    ).length;

    const trailProgress = trailItems.length
        ? Math.round((completed / trailItems.length) * 100)
        : 0;

    return { trailItems, trailProgress };
}

export function buildMenteeData(rows: MenteeRows) {
    const { profile, userStats, enrollments, activities, attempts, attendedIds, xpEntries } = rows;

    const currentEnrollment = enrollments.find((enrollment) => enrollment.status === 'active');
    const currentEdition = currentEnrollment?.editions ?? null;

    const { trailItems, trailProgress } = buildTrail(
        activities,
        attempts,
        new Set(attendedIds),
    );

    // streak is set to zero only at next activity, so, we check it here
    const streakIsAlive = !!userStats.last_active_on
        && userStats.last_active_on >= yesterdayInSaoPaulo();

    const firstEnrolledAt = enrollments.map((enrollment) => enrollment.enrolled_at).sort()[0];

    return {
        user: {
            name: profile.full_name,
            username: profile.username,
            role: profile.role,
            email: rows.email,
            verified: rows.emailVerified,
        },
        stats: {
            streak: streakIsAlive ? userStats.streak_days : 0,
            life: userStats.lives,
            xp: sumXp(xpEntries.filter((row) => row.edition_id === currentEdition?.id)),
            totalXp: sumXp(xpEntries),
        },
        trail: currentEdition
            ? { name: currentEdition.name, subtitle: currentEdition.subtitle }
            : null,
        trailItems,
        trailProgress,
        people: {
            mentors: rows.mentors
                .filter((mentor) => mentor.id === currentEnrollment?.mentor_id)
                .map((mentor) => ({ id: mentor.id, name: mentor.full_name })),
            // who can be chosen: only while the active enrollment has no mentor
            mentorChoices: currentEnrollment && !currentEnrollment.mentor_id
                ? rows.mentors.map((mentor) => ({ id: mentor.id, name: mentor.full_name }))
                : null,
            friends: rows.friends.map((friend) => ({
                id: friend.id,
                name: friend.full_name,
                xp: friend.total_xp,
            })),
        },
        journeyStart: firstEnrolledAt
            ? new Date(firstEnrolledAt).toLocaleDateString('pt-BR', {
                month: 'long',
                year: 'numeric',
                timeZone: 'America/Sao_Paulo',
            })
            : null,
        completedTrails: enrollments.filter((enrollment) => enrollment.status === 'completed').length,
        certificates: rows.signedCertificates,
    };
}

// cache: layout and page asks the same data at the same request,
// but the search is triggered only once.
export const getMenteeData = cache(async () => {
    if (isMockMode) return buildMenteeData(mockRows);

    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const [
        profile, userStats, enrollments, attendance,
        attempts, xpEntries, certificates, mentors, friends,
    ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('user_stats').select('*').eq('profile_id', user.id).single(),
        supabase.from('enrollments').select('*, editions(*)').eq('mentee_id', user.id)
            .order('enrolled_at', { ascending: false }),
        supabase.from('attendance').select('activity_id')
            .eq('mentee_id', user.id).eq('status', 'presente'),
        supabase.from('attempts')
            .select('activity_id, finished_at, correct_count, total_count, attempt_answers(count)')
            .eq('mentee_id', user.id),
        supabase.from('xp_entries').select('edition_id, xp').eq('mentee_id', user.id),
        supabase.from('certificates').select('id', { count: 'exact', head: true })
            .eq('mentee_id', user.id).eq('status', 'signed'),
        supabase.rpc('list_mentors'),
        supabase.rpc('list_friends'),
    ]);

    const failed = [
        profile, userStats, enrollments, attendance,
        attempts, xpEntries, certificates, mentors, friends,
    ].find((result) => result.error);

    if (failed?.error) throw new Error(failed.error.message);
    if (!profile.data || !userStats.data) throw new Error('Perfil não encontrado.');

    const currentEnrollment = enrollments.data?.find((enrollment) => enrollment.status === 'active');

    const activities = currentEnrollment
        ? await supabase.from('activities')
            .select('id, title, kind, position, parent_id, starts_at, ends_at, activity_items(count)')
            .eq('edition_id', currentEnrollment.edition_id)
        : null;

    if (activities?.error) throw new Error(activities.error.message);

    return buildMenteeData({
        profile: profile.data,
        email: user.email ?? '',
        emailVerified: !!user.email_confirmed_at,
        userStats: userStats.data,
        enrollments: enrollments.data ?? [],
        activities: (activities?.data ?? []).map(({ activity_items, ...activity }) => ({
            ...activity,
            itemCount: activity_items[0]?.count ?? 0,
        })),
        attempts: (attempts.data ?? []).map(({ attempt_answers, ...attempt }) => ({
            ...attempt,
            answered: attempt_answers[0]?.count ?? 0,
        })),
        attendedIds: (attendance.data ?? []).map((row) => row.activity_id),
        xpEntries: xpEntries.data ?? [],
        signedCertificates: certificates.count ?? 0,
        mentors: mentors.data ?? [],
        friends: friends.data ?? [],
    });
});