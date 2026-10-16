import { isMockMode } from '../mockMode';

import { createClient } from './client';

// Retorna null no modo demonstração ou se o cliente do Supabase não puder ser criado.
export function getSupabase() {
    if (isMockMode) return null;

    try {
        return createClient();
    } catch {
        return null;
    }
}