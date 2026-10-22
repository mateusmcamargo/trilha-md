import type { Metadata } from 'next';

import { ArrowLeft, CircleCheck, CircleX, FolderOpen, Route, Sparkles } from 'lucide-react';

import { Button } from '#/components/Button/Button';
import PageHeader from '#/components/Header/PageHeader';
import { mockEvents } from '#/utils/mockData';
import { isMockMode } from '#/utils/mockMode';
import { createClient } from '#/utils/supabase/server';

import styles from './page.module.scss';

export const metadata: Metadata = {
    title: 'Confirmar presença',
};

type Result =
    | { ok: true; activity: { id: string; title: string; points: number } }
    | { ok: false; message: string };

// the QR Code opens this page: visiting it is the check-in
async function checkIn(code: string): Promise<Result> {
    if (isMockMode) {
        const event = mockEvents[4];
        return { ok: true, activity: { id: event.id, title: event.title, points: event.points } };
    }

    const supabase = await createClient();
    const { data: activityId, error } = await supabase.rpc('check_in', { p_code: code });

    if (error || !activityId) {
        return {
            ok: false,
            message: error?.code === '42501'
                ? 'Você não está matriculada na edição deste encontro.'
                : 'Este código não vale mais. Peça para a mentora mostrar o QR Code de novo.',
        };
    }

    const { data } = await supabase.from('activities').select('id, title, points').eq('id', activityId).single();
    return { ok: true, activity: data ?? { id: activityId, title: 'Encontro', points: 0 } };
}

export default async function CheckinPage({ params }: { params: Promise<{ code: string }> }) {
    const { code } = await params;
    const result = await checkIn(decodeURIComponent(code));

    return (
        <>
            <PageHeader title='Presença' action={{ href: '/trail', label: 'Voltar à trilha', icon: ArrowLeft }}/>

            <main className='main-subpage' aria-label='Confirmação de presença'>
                {result.ok ? (
                    <section className={`${styles.card} ${styles.success}`} aria-labelledby='checkin-title'>
                        <CircleCheck className={styles.icon} aria-hidden='true'/>
                        <h2 id='checkin-title'>Presença confirmada!</h2>
                        <p className={styles.event}>{result.activity.title}</p>
                        <p className={styles.xp}><Sparkles aria-hidden='true'/>+{result.activity.points} XP</p>

                        <div className={styles.actions}>
                            <Button href={`/trail/${result.activity.id}`} variant='brand' icon={FolderOpen} fullWidth>
                                Ver materiais
                            </Button>
                            <Button href='/trail' icon={Route} fullWidth>Voltar à trilha</Button>
                        </div>
                    </section>
                ) : (
                    <section className={`${styles.card} ${styles.error}`} aria-labelledby='checkin-title'>
                        <CircleX className={styles.icon} aria-hidden='true'/>
                        <h2 id='checkin-title'>Não deu certo</h2>
                        <p>{result.message}</p>

                        <div className={styles.actions}>
                            <Button href='/trail' variant='brand' icon={Route} fullWidth>Voltar à trilha</Button>
                        </div>
                    </section>
                )}
            </main>
        </>
    );
}
