import { cache } from 'react';
import { redirect } from 'next/navigation';

import type { Tables } from '#/types/database';

import { yesterdayInSaoPaulo } from './dates';
import { mentorProfile, mockMenteeRows, mockXpRows } from './mockData';
import { isMockMode } from './mockMode';
import { createClient } from './supabase/server';

function buildTeamUser(profile: Tables<'profiles'>, email: string, verified: boolean) {
    return {
        name: profile.full_name,
        username: profile.username,
        role: profile.role,
        email,
        verified,
    };
}

export const getTeamData = cache(async () => {
    if (isMockMode) {
        return { user: buildTeamUser(mentorProfile, 'maria.silva@exemplo.com', true) };
    }

    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: profile, error } = await supabase
        .from('profiles').select('*').eq('id', user.id).single();

    if (error) throw new Error(error.message);
    // deactivated account: the session may still be open on another device
    if (profile.deleted_at) redirect('/auth/signout');

    return { user: buildTeamUser(profile, user.email ?? '', !!user.email_confirmed_at) };
});

type ProfileSummary = Pick<Tables<'profiles'>, 'id' | 'full_name' | 'avatar_url'>;

export interface MenteeRow extends ProfileSummary {
    username: string;
    // active enrollment only (filtered in the query)
    enrollments: (Pick<Tables<'enrollments'>, 'id' | 'edition_id'> & {
        editions: Pick<Tables<'editions'>, 'name'> | null;
        mentor: ProfileSummary | null;
    })[];
    user_stats: Pick<Tables<'user_stats'>, 'streak_days' | 'last_active_on'> | null;
}

// comes from list_mentee_xp: attendance rows are readable only by the responsible mentor (RLS)
export interface XpRow {
    mentee_id: string;
    edition_id: string;
    xp: number;
}

function buildMenteesData(
    userId: string,
    rows: MenteeRow[],
    xpRows: XpRow[],
    avatarUrls: Map<string, string>,
) {
    const avatar = (path: string | null) => (path ? avatarUrls.get(path) ?? null : null);

    const all = rows.map((row) => {
        const enrollment = row.enrollments[0] ?? null;

        // xp of the current trail, as in buildMenteeData
        const xp = xpRows
            .filter((xpRow) => xpRow.mentee_id === row.id
                && xpRow.edition_id === enrollment?.edition_id)
            .reduce((total, xpRow) => total + xpRow.xp, 0);

        return {
            id: row.id,
            name: row.full_name,
            username: row.username,
            avatarUrl: avatar(row.avatar_url),
            xp,
            // streak is set to zero only at next activity, so we check it here, as in buildMenteeData
            streak: row.user_stats && (
                row.user_stats.last_active_on && row.user_stats.last_active_on >= yesterdayInSaoPaulo()
                    ? row.user_stats.streak_days
                    : 0
            ),
            enrollment: enrollment && {
                id: enrollment.id,
                editionId: enrollment.edition_id,
                trailName: enrollment.editions?.name ?? null,
                mentor: enrollment.mentor && {
                    id: enrollment.mentor.id,
                    name: enrollment.mentor.full_name,
                    avatarUrl: avatar(enrollment.mentor.avatar_url),
                },
            },
        };
    });

    return {
        mine: all.filter((mentee) => mentee.enrollment?.mentor?.id === userId),
        all,
    };
}

export type MenteeItem = ReturnType<typeof buildMenteesData>['all'][number];

export const getMenteesData = cache(async () => {
    if (isMockMode) {
        return buildMenteesData(mentorProfile.id, mockMenteeRows, mockXpRows, new Map());
    }

    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const [mentees, xp] = await Promise.all([
        supabase.from('profiles')
            .select(`
                id, full_name, username, avatar_url,
                user_stats(streak_days, last_active_on),
                enrollments!enrollments_mentee_id_fkey(
                    id, edition_id,
                    editions(name),
                    mentor:profiles!enrollments_mentor_id_fkey(id, full_name, avatar_url)
                )
            `)
            .eq('role', 'mentee')
            .is('deleted_at', null)
            .eq('enrollments.status', 'active')
            .order('full_name'),
        supabase.rpc('list_mentee_xp'),
    ]);

    if (mentees.error) throw new Error(mentees.error.message);
    if (xp.error) throw new Error(xp.error.message);

    // avatar_url holds the path in the private bucket: sign all urls at once
    const paths = [...new Set(mentees.data.flatMap((row) => [
        row.avatar_url,
        ...row.enrollments.map((enrollment) => enrollment.mentor?.avatar_url),
    ]).filter((path): path is string => !!path))];

    const avatarUrls = new Map<string, string>();

    if (paths.length) {
        const { data: signed } = await supabase.storage.from('avatars').createSignedUrls(paths, 3600);
        signed?.forEach(({ path, signedUrl }) => {
            if (path && signedUrl) avatarUrls.set(path, signedUrl);
        });
    }

    return buildMenteesData(user.id, mentees.data, xp.data, avatarUrls);
});
