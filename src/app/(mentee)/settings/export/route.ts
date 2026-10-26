import { todayInSaoPaulo } from '#/utils/dates';
import { mockPreferences, mockRows } from '#/utils/mockData';
import { isMockMode } from '#/utils/mockMode';
import { createClient } from '#/utils/supabase/server';

// "Exportar meus dados" (settings > profile): a JSON file with everything about the user.
// RLS keeps every query to her own rows.
export async function GET() {
    const data = isMockMode ? demoData() : await realData();
    if (!data) return new Response('Sessão expirada. Entre de novo.', { status: 401 });

    return new Response(JSON.stringify(data, null, 4), {
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Disposition': `attachment; filename="aster-meus-dados-${todayInSaoPaulo()}.json"`,
            'Cache-Control': 'no-store',
        },
    });
}

function demoData() {
    return {
        exported_at: new Date().toISOString(),
        demo: true,
        profile: mockRows.profile,
        email: mockRows.email,
        stats: mockRows.userStats,
        preferences: mockPreferences,
        enrollments: mockRows.enrollments,
        xp: mockRows.xpEntries,
        attempts: mockRows.attempts,
    };
}

async function realData() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const [
        profile, stats, preferences, enrollments, attendance,
        attempts, xp, reflections, certificates, friendships,
    ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('user_stats').select('*').eq('profile_id', user.id).maybeSingle(),
        supabase.from('user_preferences').select('*').eq('profile_id', user.id).maybeSingle(),
        supabase.from('enrollments').select('*, editions(name, subtitle)').eq('mentee_id', user.id),
        supabase.from('attendance').select('*, activities(title)').eq('mentee_id', user.id),
        supabase.from('attempts').select('*, attempt_answers(*)').eq('mentee_id', user.id),
        supabase.from('xp_entries').select('*').eq('mentee_id', user.id),
        supabase.from('reflections').select('*').eq('mentee_id', user.id),
        supabase.from('certificates').select('*').eq('mentee_id', user.id),
        supabase.rpc('list_friends'),
    ]);

    const failed = [
        profile, stats, preferences, enrollments, attendance,
        attempts, xp, reflections, certificates, friendships,
    ].find((result) => result.error);

    if (failed?.error) throw new Error(failed.error.message);

    return {
        exported_at: new Date().toISOString(),
        profile: profile.data,
        email: user.email,
        stats: stats.data,
        preferences: preferences.data,
        enrollments: enrollments.data,
        attendance: attendance.data,
        attempts: attempts.data,
        xp: xp.data,
        reflections: reflections.data,
        certificates: certificates.data,
        friends: friendships.data,
    };
}
