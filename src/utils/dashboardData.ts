import { cache } from 'react';
import { notFound, redirect } from 'next/navigation';

import type { Tables } from '#/types/database';

import { dayInSaoPaulo, todayInSaoPaulo, yesterdayInSaoPaulo } from './dates';
import { buildTrail, type TrailActivity, type TrailAttempt } from './menteeData';
import { mockDashboardInput, mockOverviewRates } from './mockData';
import { isMockMode } from './mockMode';
import { createClient } from './supabase/server';
import { getMenteesData } from './teamData';

// what the query returns (or the mock): the builder below only does the math
export interface DashboardInput {
    mentee: Pick<Tables<'profiles'>, 'id' | 'full_name' | 'username' | 'avatar_url'>;
    avatarUrl: string | null;
    trailName: string | null;
    trailSubtitle: string | null;
    // remote and in-person activities of the active trail
    activities: TrailActivity[];
    attendance: Pick<Tables<'attendance'>, 'activity_id' | 'status' | 'checked_in_at'>[];
    reflections: Pick<Tables<'reflections'>, 'rating' | 'created_at'>[];
    attempts: TrailAttempt[];
    answers: Pick<Tables<'attempt_answers'>, 'is_correct'>[];
    xpEntries: Pick<Tables<'xp_entries'>, 'xp' | 'earned_at'>[];
    stats: Pick<Tables<'user_stats'>, 'streak_days' | 'last_active_on'> | null;
    certificateStatus: string | null;
    // xp of every trail she took (xpEntries above is only the active one)
    xpAllTrails: number;
}

const oneDay = 24 * 60 * 60 * 1000;

// longest run of consecutive days ('YYYY-MM-DD', no repeats)
function longestRun(dates: string[]) {
    const sorted = [...dates].sort();
    let best = 0;
    let run  = 0;

    sorted.forEach((date, index) => {
        const previous = sorted[index - 1];
        const consecutive = previous !== undefined
            && Date.parse(`${date}T12:00:00Z`) - Date.parse(`${previous}T12:00:00Z`) === oneDay;

        run = consecutive ? run + 1 : 1;
        best = Math.max(best, run);
    });

    return best;
}

type EventRow = Pick<Tables<'activities'>, 'id' | 'title' | 'starts_at'>;
type AttendanceRow = Pick<Tables<'attendance'>, 'activity_id' | 'status'>;

// status of each in-person activity that already happened (or has a record):
// mentors don't insert absences, so a past event without presence counts as 'falta'
export function eventRecords(events: EventRow[], attendance: AttendanceRow[]) {
    const today = todayInSaoPaulo();

    return events.flatMap((event) => {
        const row = attendance.find((item) => item.activity_id === event.id);
        if (!event.starts_at) return [];
        const date = dayInSaoPaulo(event.starts_at);
        if (row) return [{ title: event.title, date, status: row.status }];
        return date < today ? [{ title: event.title, date, status: 'falta' }] : [];
    });
}

export function attendanceRate(records: { status: string }[]) {
    return records.length
        ? Math.round((records.filter((row) => row.status === 'presente').length / records.length) * 100)
        : null;
}

function buildDashboard(input: DashboardInput) {
    const events = input.activities.filter((activity) => activity.kind === 'presencial');
    const remotes = input.activities.filter((activity) => activity.kind === 'remota');
    const records = eventRecords(events, input.attendance);

    const count = (status: string) => records.filter((row) => row.status === status).length;
    const present   = count('presente');
    const absent    = count('falta');
    const justified = count('justificada');
    const registered = records.length;

    // xp is not stored: xp_entries (presences + best attempts), accumulated by day
    const xpByDate = new Map<string, number>();
    input.xpEntries.forEach((row) => {
        if (!row.earned_at) return;
        const date = dayInSaoPaulo(row.earned_at);
        xpByDate.set(date, (xpByDate.get(date) ?? 0) + (row.xp ?? 0));
    });

    // mastered: some finished attempt with every item right
    const masteredIds = new Set(input.attempts
        .filter((attempt) => attempt.finished_at && attempt.total_count
            && attempt.correct_count === attempt.total_count)
        .map((attempt) => attempt.activity_id));

    let accumulated = 0;
    const xpSeries = [...xpByDate.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, points]) => ({ date, xp: (accumulated += points) }));

    // calendar: presences + reflections + finished attempts, per day
    const days: Record<string, number> = {};
    const bump = (date: string) => { days[date] = (days[date] ?? 0) + 1; };
    input.attendance.forEach((row) => {
        if (row.status === 'presente' && row.checked_in_at) bump(dayInSaoPaulo(row.checked_in_at));
    });
    input.reflections.forEach((row) => bump(dayInSaoPaulo(row.created_at)));
    input.attempts.forEach((row) => {
        if (row.finished_at) bump(dayInSaoPaulo(row.finished_at));
    });

    const recent = [...records]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 5);

    const accuracy = input.answers.length
        ? Math.round((input.answers.filter((row) => row.is_correct).length / input.answers.length) * 100)
        : null;

    const ratings = input.reflections.map((reflection) => reflection.rating);

    const streak = input.stats && (
        input.stats.last_active_on && input.stats.last_active_on >= yesterdayInSaoPaulo()
            ? input.stats.streak_days
            : 0
    );

    const activeDays = Object.keys(days);
    const activityCount = Object.values(days).reduce((sum, count) => sum + count, 0);

    return {
        mentee: {
            id: input.mentee.id,
            name: input.mentee.full_name,
            username: input.mentee.username,
            avatarUrl: input.avatarUrl,
            trailName: input.trailName,
        },
        xpTrail: accumulated,
        xpAllTrails: input.xpAllTrails,
        xpSeries,
        xpDaily: [...xpByDate.entries()]
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, xp]) => ({ date, xp })),
        attendance: {
            present,
            absent,
            justified,
            registered,
            rate: attendanceRate(records),
        },
        recent,
        streak,
        // not stored: longest run in the activity calendar (this trail), never below the current streak
        streakRecord: Math.max(longestRun(activeDays), streak ?? 0),
        lastActiveOn: input.stats?.last_active_on ?? null,
        reflections: {
            count: ratings.length,
            average: ratings.length
                ? Math.round((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length) * 10) / 10
                : null,
        },
        progress: {
            mastered: masteredIds.size,
            total: remotes.length,
        },
        masteredRate: remotes.length
            ? Math.round((masteredIds.size / remotes.length) * 100)
            : null,
        // average of the calendar's activities over the days she did something
        activitiesPerDay: activeDays.length
            ? Math.round((activityCount / activeDays.length) * 10) / 10
            : null,
        // right answers over every answered item of the trail
        accuracy,
        certificateStatus: input.certificateStatus,
        days,
    };
}

export type MenteeDashboard = ReturnType<typeof buildDashboard>;

// shared by the dashboard and the mentee's trail: only the responsible mentor gets the data
const loadDashboardInput = cache(async (menteeId: string): Promise<DashboardInput> => {
    if (isMockMode) {
        const input = mockDashboardInput(menteeId);
        if (!input) notFound();
        return input;
    }

    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // only the responsible mentor (RLS also guarantees it)
    const { data: enrollment, error } = await supabase
        .from('enrollments')
        .select('edition_id, editions(name, subtitle)')
        .eq('mentee_id', menteeId)
        .eq('mentor_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

    if (error) throw new Error(error.message);
    if (!enrollment) notFound();

    const editionId = enrollment.edition_id;

    const [
        profile, activities, attendance, reflections, attempts, answers, stats, certificate, xpEntries,
    ] = await Promise.all([
        supabase.from('profiles').select('id, full_name, username, avatar_url').eq('id', menteeId).is('deleted_at', null).maybeSingle(),
        supabase.from('activities')
            .select('id, title, kind, position, parent_id, starts_at, ends_at, activity_items(count)')
            .eq('edition_id', editionId),
        supabase.from('attendance').select('activity_id, status, checked_in_at, activities!inner(edition_id)')
            .eq('mentee_id', menteeId).eq('activities.edition_id', editionId),
        supabase.from('reflections').select('rating, created_at')
            .eq('mentee_id', menteeId).eq('edition_id', editionId),
        supabase.from('attempts')
            .select('activity_id, finished_at, correct_count, total_count, attempt_answers(count), activities!inner(edition_id)')
            .eq('mentee_id', menteeId).eq('activities.edition_id', editionId),
        supabase.from('attempt_answers')
            .select('is_correct, attempts!inner(mentee_id, activities!inner(edition_id))')
            .eq('attempts.mentee_id', menteeId).eq('attempts.activities.edition_id', editionId),
        supabase.from('user_stats').select('streak_days, last_active_on').eq('profile_id', menteeId).maybeSingle(),
        supabase.from('certificates').select('status')
            .eq('mentee_id', menteeId).eq('edition_id', editionId).maybeSingle(),
        // every trail, not only the active one: total xp
        supabase.from('xp_entries').select('edition_id, xp, earned_at').eq('mentee_id', menteeId),
    ]);

    for (const result of [profile, activities, attendance, reflections, attempts, answers, stats, certificate, xpEntries]) {
        if (result.error) throw new Error(result.error.message);
    }

    // deactivated mentee: the page behaves as if she didn't exist
    if (!profile.data) notFound();

    let avatarUrl: string | null = null;
    if (profile.data.avatar_url) {
        const { data: signed } = await supabase.storage
            .from('avatars').createSignedUrl(profile.data.avatar_url, 3600);
        avatarUrl = signed?.signedUrl ?? null;
    }

    return {
        mentee: profile.data,
        avatarUrl,
        trailName: enrollment.editions?.name ?? null,
        trailSubtitle: enrollment.editions?.subtitle ?? null,
        activities: activities.data!.map(({ activity_items, ...activity }) => ({
            ...activity,
            itemCount: activity_items[0]?.count ?? 0,
        })),
        attendance: attendance.data!,
        reflections: reflections.data!,
        attempts: attempts.data!.map(({ attempt_answers, ...attempt }) => ({
            ...attempt,
            answered: attempt_answers[0]?.count ?? 0,
        })),
        answers: answers.data!,
        xpEntries: xpEntries.data!.filter((row) => row.edition_id === editionId),
        stats: stats.data,
        certificateStatus: certificate.data?.status ?? null,
        xpAllTrails: xpEntries.data!.reduce((total, row) => total + (row.xp ?? 0), 0),
    };
});

export const getMenteeDashboard = cache(async (menteeId: string) =>
    buildDashboard(await loadDashboardInput(menteeId)));

// same trail the mentee sees in /trail, built from her attempts and presences
export const getMenteeTrail = cache(async (menteeId: string) => {
    const input = await loadDashboardInput(menteeId);

    const presentIds = new Set(input.attendance
        .filter((row) => row.status === 'presente')
        .map((row) => row.activity_id));

    return {
        mentee: { name: input.mentee.full_name },
        trail: { name: input.trailName ?? 'Sem nome', subtitle: input.trailSubtitle },
        ...buildTrail(input.activities, input.attempts, presentIds),
    };
});

// mentees of the logged mentor with the numbers of the general dashboard
export const getDashboardOverview = cache(async () => {
    const { mine } = await getMenteesData();

    let rates = new Map<string, number | null>();

    if (isMockMode) {
        rates = new Map(Object.entries(mockOverviewRates));
    } else if (mine.length) {
        const supabase = await createClient();

        const editionIds = [...new Set(mine.flatMap((mentee) =>
            mentee.enrollment ? [mentee.enrollment.editionId] : []))];

        // RLS: attendance is readable only for the mentor's own mentees
        const [attendance, events] = await Promise.all([
            supabase.from('attendance').select('mentee_id, activity_id, status')
                .in('mentee_id', mine.map((mentee) => mentee.id)),
            supabase.from('activities').select('id, title, starts_at, edition_id')
                .eq('kind', 'presencial').in('edition_id', editionIds),
        ]);

        if (attendance.error) throw new Error(attendance.error.message);
        if (events.error) throw new Error(events.error.message);

        mine.forEach((mentee) => {
            const records = eventRecords(
                events.data.filter((event) => event.edition_id === mentee.enrollment?.editionId),
                attendance.data.filter((row) => row.mentee_id === mentee.id),
            );
            rates.set(mentee.id, attendanceRate(records));
        });
    }

    const mentees = mine.map((mentee) => ({ ...mentee, rate: rates.get(mentee.id) ?? null }));
    const rated = mentees.flatMap((mentee) => (mentee.rate === null ? [] : [mentee.rate]));

    return {
        mentees,
        xpTotal: mentees.reduce((total, mentee) => total + mentee.xp, 0),
        averageRate: rated.length
            ? Math.round(rated.reduce((sum, rate) => sum + rate, 0) / rated.length)
            : null,
        withoutStreak: mentees.filter((mentee) => !mentee.streak).length,
    };
});

export type DashboardMentee = Awaited<ReturnType<typeof getDashboardOverview>>['mentees'][number];
