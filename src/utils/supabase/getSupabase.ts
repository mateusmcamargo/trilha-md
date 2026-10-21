import { isMockMode } from '../mockMode';

import { createClient } from './client';

// returns null in demo mode or if the supabase client can't be created
export function getSupabase() {
    if (isMockMode) return null;

    try {
        return createClient();
    } catch {
        return null;
    }
}