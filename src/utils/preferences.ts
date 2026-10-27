import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import type { Tables } from '#/types/database';

import { MOTION_COOKIE, SOUNDS_COOKIE, THEME_COOKIE } from './appearance';
import { mockPreferences } from './mockData';
import { isMockMode } from './mockMode';
import { createClient } from './supabase/server';

export type Preferences = Tables<'user_preferences'>;

// own row only (RLS); created with the profile by handle_new_user
export const getPreferences = cache(async (): Promise<Preferences> => {
    // demo mode: nothing is saved, so theme, animations and sounds come from this device's cookies
    if (isMockMode) {
        const cookieStore = await cookies();
        const theme = cookieStore.get(THEME_COOKIE)?.value;
        return {
            ...mockPreferences,
            theme: theme ?? mockPreferences.theme,
            animations_enabled: cookieStore.get(MOTION_COOKIE)?.value !== 'reduced',
            sounds_enabled: cookieStore.get(SOUNDS_COOKIE)?.value !== 'off',
        };
    }

    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data, error } = await supabase
        .from('user_preferences').select('*').eq('profile_id', user.id).single();

    if (error) throw new Error(error.message);
    return data;
});
