import { cache } from 'react';
import { notFound, redirect } from 'next/navigation';

import type { Tables } from '#/types/database';

import { yesterdayInSaoPaulo } from './dates';
import { buildTrail } from './menteeData';
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
    // ordered by position
    activities: Pick<Tables<'activities'>, 'id' | 'title' | 'activity_date' | 'points'>[];
    attendance: Pick<Tables<'attendance'>, 'activity_id' | 'status' | 'checked_in_at'>[];
    reflections: Pick<Tables<'reflections'>, 'rating' | 'created_at'>[];
    progress: Pick<Tables<'activity_progress'>, 'activity_id' | 'progress' | 'mastered_at' | 'updated_at'>[];
    stats: Pick<Tables<'user_stats'>, 'streak_days' | 'last_active_on'> | null;
    certificateStatus: string | null;
    // xp of every trail she took (attendance above is only the active one)
    xpAllTrails: number;
}

const day = (timestamp: string) => timestamp.slice(0, 10);

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

function buildDashboard(input: DashboardInput) {
    const activityById = new Map(input.activities.map((activity) => [activity.id, activity]));

    const count = (status: string) =>
        input.attendance.filter((row) => row.status === status).length;
    const present   = count('presente');
    const absent    = count('falta');
    const justified = count('justificada');
    const registered = present + absent + justified;

    // xp is not stored: sum of points of the present rows, accumulated by activity date
    const xpByDate = new Map<string, number>();
    input.attendance
        .filter((row) => row.status === 'presente')
        .forEach((row) => {
            const activity = activityById.get(row.activity_id);
            if (!activity) return;
            xpByDate.set(activity.activity_date, (xpByDate.get(activity.activity_date) ?? 0) + activity.points);
        });

    let accumulated = 0;
    const xpSeries = [...xpByDate.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, points]) => ({ date, xp: (accumulated += points) }));

    // calendar: presences + reflections + progress updates, per day
    const days: Record<string, number> = {};
    const bump = (date: string) => { days[date] = (days[date] ?? 0) + 1; };
    input.attendance.forEach((row) => {
        const activity = activityById.get(row.activity_id);
        if (row.status === 'presente' && activity) bump(row.checked_in_at ? day(row.checked_in_at) : activity.activity_date);
    });
    input.reflections.forEach((row) => bump(day(row.created_at)));
    input.progress.forEach((row) => bump(day(row.updated_at)));

    const recent = input.attendance
        .flatMap((row) => {
            const activity = activityById.get(row.activity_id);
            return activity ? [{ title: activity.title, date: activity.activity_date, status: row.status }] : [];
        })
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 5);

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
            rate: registered ? Math.round((present / registered) * 100) : null,
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
            mastered: input.progress.filter((row) => row.mastered_at).length,
            total: input.activities.length,
        },
        masteredRate: input.activities.length
            ? Math.round((input.progress.filter((row) => row.mastered_at).length / input.activities.length) * 100)
            : null,
        // average of the calendar's activities over the days she did something
        activitiesPerDay: activeDays.length
            ? Math.round((activityCount / activeDays.length) * 10) / 10
            : null,
        // there is no record of right answers yet
        accuracy: null as number | null,
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

    const [profile, activities, attendance, reflections, progress, stats, certificate, presences] = await Promise.all([
        supabase.from('profiles').select('id, full_name, username, avatar_url').eq('id', menteeId).single(),
        supabase.from('activities').select('id, title, activity_date, points')
            .eq('edition_id', editionId).order('position'),
        supabase.from('attendance').select('activity_id, status, checked_in_at, activities!inner(edition_id)')
            .eq('mentee_id', menteeId).eq('activities.edition_id', editionId),
        supabase.from('reflections').select('rating, created_at')
            .eq('mentee_id', menteeId).eq('edition_id', editionId),
        supabase.from('activity_progress').select('activity_id, progress, mastered_at, updated_at, activities!inner(edition_id)')
            .eq('mentee_id', menteeId).eq('activities.edition_id', editionId),
        supabase.from('user_stats').select('streak_days, last_active_on').eq('profile_id', menteeId).maybeSingle(),
        supabase.from('certificates').select('status')
            .eq('mentee_id', menteeId).eq('edition_id', editionId).maybeSingle(),
        // every trail, not only the active one: total xp
        supabase.from('attendance').select('activities(points)')
            .eq('mentee_id', menteeId).eq('status', 'presente'),
    ]);

    for (const result of [profile, activities, attendance, reflections, progress, stats, certificate, presences]) {
        if (result.error) throw new Error(result.error.message);
    }

    let avatarUrl: string | null = null;
    if (profile.data!.avatar_url) {
        const { data: signed } = await supabase.storage
            .from('avatars').createSignedUrl(profile.data!.avatar_url, 3600);
        avatarUrl = signed?.signedUrl ?? null;
    }

    return {
        mentee: profile.data!,
        avatarUrl,
        trailName: enrollment.editions?.name ?? null,
        trailSubtitle: enrollment.editions?.subtitle ?? null,
        activities: activities.data!,
        attendance: attendance.data!,
        reflections: reflections.data!,
        progress: progress.data!,
        stats: stats.data,
        certificateStatus: certificate.data?.status ?? null,
        xpAllTrails: presences.data!.reduce((total, row) => total + (row.activities?.points ?? 0), 0),
    };
});

export const getMenteeDashboard = cache(async (menteeId: string) =>
    buildDashboard(await loadDashboardInput(menteeId)));

// same trail the mentee sees in /trail, built from her attendance and progress
export const getMenteeTrail = cache(async (menteeId: string) => {
    const input = await loadDashboardInput(menteeId);

    const presentIds = new Set(input.attendance
        .filter((row) => row.status === 'presente')
        .map((row) => row.activity_id));

    return {
        mentee: { name: input.mentee.full_name },
        trail: { name: input.trailName ?? 'Sem nome', subtitle: input.trailSubtitle },
        ...buildTrail(input.activities, presentIds, input.progress),
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

        // RLS: attendance is readable only for the mentor's own mentees
        const { data, error } = await supabase
            .from('attendance')
            .select('mentee_id, status')
            .in('mentee_id', mine.map((mentee) => mentee.id));

        if (error) throw new Error(error.message);

        mine.forEach((mentee) => {
            const rows = data.filter((row) => row.mentee_id === mentee.id);
            rates.set(mentee.id, rows.length
                ? Math.round((rows.filter((row) => row.status === 'presente').length / rows.length) * 100)
                : null);
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
