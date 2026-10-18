import type { Database } from '#/types/database';
import { createBrowserClient } from '@supabase/ssr';

export function createClient<Database>() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}