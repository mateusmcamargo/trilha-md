import { cache } from 'react';
import { redirect } from 'next/navigation';

import type { TrailNodeStatus } from '#/components/Trail/TrailNode';
import type { Database, Tables } from '#/types/database';

import { yesterdayInSaoPaulo } from './dates';
import { mockRows } from './mockData';
import { isMockMode } from './mockMode';
import { createClient } from './supabase/server';

type Functions = Database['public']['Functions'];

export interface PanelRows {
    profile: Tables<'profiles'>;
    email: string;
    emailVerified: boolean;
    userStats: Tables<'user_stats'>;
    enrollments: (Tables<'enrollments'> & { editions: Tables<'editions'> })[];
    activities: Tables<'activities'>[]; // current edition
    attendance: (Tables<'attendance'> & {
        activities: Pick<Tables<'activities'>, 'points' | 'edition_id'>;
    })[];
    activityProgress: Tables<'activity_progress'>[];
    signedCertificates: number;
    mentors: Functions['list_mentors']['Returns'];
    friends: Functions['list_friends']['Returns'];
}

interface TrailItem {
    id: string;
    title: string;
    status: TrailNodeStatus;
    progress: number;
}

function sumPoints(rows: PanelRows['attendance']) {
    return rows.reduce((total, row) => total + row.activities.points, 0);
}

export function buildPanelData(rows: PanelRows) {
    const { profile, userStats, enrollments, activities, attendance, activityProgress } = rows;

    const currentEnrollment = enrollments.find((enrollment) => enrollment.status === 'active');
    const currentEdition = currentEnrollment?.editions ?? null;

    const doneIds = new Set(attendance.map((row) => row.activity_id));
    const progressByActivity = new Map(activityProgress.map((row) => [row.activity_id, row]));

    let availableFound = false;

    const trailItems: TrailItem[] = activities.map((activity) => {
        const progress = progressByActivity.get(activity.id);

        if (doneIds.has(activity.id)) {
            return {
                id: activity.id,
                title: activity.title,
                status: progress?.mastered_at ? 'mastered' : 'completed',
                progress: 100,
            };
        }

        if (!availableFound) {
            availableFound = true;
            return {
                id: activity.id,
                title: activity.title,
                status: 'available',
                progress: progress?.progress ?? 0,
            };
        }

        return { id: activity.id, title: activity.title, status: 'locked', progress: 0 };
    });

    const completed = trailItems.filter(
        (item) => item.status === 'completed' || item.status === 'mastered'
    ).length;

    const trailProgress = trailItems.length
        ? Math.round((completed / trailItems.length) * 100)
        : 0;

    // streak is set to zero only at next activity, so, we check it here
    const streakIsAlive = !!userStats.last_active_on
        && userStats.last_active_on >= yesterdayInSaoPaulo();

    const firstEnrolledAt = enrollments.map((enrollment) => enrollment.enrolled_at).sort()[0];

    return {
        user: {
            name: profile.full_name,
            username: profile.username,
            email: rows.email,
            verified: rows.emailVerified,
        },
        stats: {
            streak: streakIsAlive ? userStats.streak_days : 0,
            life: userStats.lives,
            xp: sumPoints(attendance.filter((row) => row.activities.edition_id === currentEdition?.id)),
            totalXp: sumPoints(attendance),
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
export const getPanelData = cache(async () => {
    if (isMockMode) return buildPanelData(mockRows);

    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const [
        profile, userStats, enrollments, attendance,
        activityProgress, certificates, mentors, friends,
    ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('user_stats').select('*').eq('profile_id', user.id).single(),
        supabase.from('enrollments').select('*, editions(*)').eq('mentee_id', user.id)
            .order('enrolled_at', { ascending: false }),
        supabase.from('attendance').select('*, activities(points, edition_id)')
            .eq('mentee_id', user.id).eq('status', 'presente'),
        supabase.from('activity_progress').select('*').eq('mentee_id', user.id),
        supabase.from('certificates').select('id', { count: 'exact', head: true })
            .eq('mentee_id', user.id).eq('status', 'signed'),
        supabase.rpc('list_mentors'),
        supabase.rpc('list_friends'),
    ]);

    const failed = [
        profile, userStats, enrollments, attendance,
        activityProgress, certificates, mentors, friends,
    ].find((result) => result.error);

    if (failed?.error) throw new Error(failed.error.message);
    if (!profile.data || !userStats.data) throw new Error('Perfil não encontrado.');

    const currentEnrollment = enrollments.data?.find((enrollment) => enrollment.status === 'active');

    const activities = currentEnrollment
        ? await supabase.from('activities').select('*')
            .eq('edition_id', currentEnrollment.edition_id).order('position')
        : null;

    if (activities?.error) throw new Error(activities.error.message);

    return buildPanelData({
        profile: profile.data,
        email: user.email ?? '',
        emailVerified: !!user.email_confirmed_at,
        userStats: userStats.data,
        enrollments: enrollments.data ?? [],
        activities: activities?.data ?? [],
        attendance: attendance.data ?? [],
        activityProgress: activityProgress.data ?? [],
        signedCertificates: certificates.count ?? 0,
        mentors: mentors.data ?? [],
        friends: friends.data ?? [],
    });
});