import { cache } from 'react';
import { redirect } from 'next/navigation';

import type { Tables } from '#/types/database';

import { mentorProfile } from './mockData';
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

    return { user: buildTeamUser(profile, user.email ?? '', !!user.email_confirmed_at) };
});