import { NextResponse } from 'next/server';

import { createClient } from '#/utils/supabase/server';

// server components can't clear cookies: they redirect here to end the session
// only for a deactivated account, so a GET link can't log anyone else out
export async function GET(request: Request) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    const { data: profile } = user
        ? await supabase.from('profiles').select('deleted_at').eq('id', user.id).single()
        : { data: null };

    if (!profile?.deleted_at) {
        return NextResponse.redirect(new URL(user ? '/trail' : '/login', request.url));
    }

    await supabase.auth.signOut();

    return NextResponse.redirect(new URL('/login', request.url));
}
