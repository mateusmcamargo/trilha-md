'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Check, RotateCcw } from 'lucide-react';

import { Button } from '#/components/Button/Button';
import type { Tables } from '#/types/database';
import { formatDate } from '#/utils/dates';
import { getSupabase } from '#/utils/supabase/getSupabase';

import { categoryLabel } from './abuseCategories';

import styles from './Settings.module.scss';

export type AbuseReport = Tables<'abuse_reports'> & {
    reporter: Pick<Tables<'profiles'>, 'full_name' | 'username'> | null;
};

// any mentor reads and resolves the reports (RLS)
export function AbuseReportList({ reports }: { reports: AbuseReport[] }) {
    const router = useRouter();
    const supabase = getSupabase();

    // demo mode: the status only changes on the screen
    const [statuses, setStatuses] = useState<Record<string, string>>({});
    const [busyId, setBusyId] = useState<string | null>(null);
    const [message, setMessage] = useState('');

    const statusOf = (report: AbuseReport) => statuses[report.id] ?? report.status;

    async function toggle(report: AbuseReport) {
        const next = statusOf(report) === 'aberta' ? 'resolvida' : 'aberta';
        setMessage('');

        if (!supabase) {
            setStatuses((current) => ({ ...current, [report.id]: next }));
            setMessage('Modo demonstração: nada foi salvo.');
            return;
        }

        setBusyId(report.id);
        const { error } = await supabase.from('abuse_reports').update({ status: next }).eq('id', report.id);
        setBusyId(null);

        if (error) return setMessage('ERRO: Não foi possível atualizar. Tente novamente.');

        setStatuses((current) => ({ ...current, [report.id]: next }));
        setMessage(next === 'resolvida' ? 'Denúncia marcada como resolvida.' : 'Denúncia reaberta.');
        router.refresh();
    }

    if (!reports.length) return <p>Nenhuma denúncia por enquanto.</p>;

    // open ones first, newest first inside each group
    const sorted = [...reports].sort((a, b) =>
        Number(statusOf(a) !== 'aberta') - Number(statusOf(b) !== 'aberta')
        || b.created_at.localeCompare(a.created_at));

    return (
        <>
            <p role='status' className={styles.status}>{message}</p>

            <ul className={styles.cards}>
                {sorted.map((report) => {
                    const open = statusOf(report) === 'aberta';
                    const reporterName = report.reporter?.full_name ?? 'Conta removida';

                    return (
                        <li key={report.id} className={styles.card}>
                            <span className={[styles.tag, !open && styles.muted].filter(Boolean).join(' ')}>
                                {open ? 'Aberta' : 'Resolvida'}
                            </span>

                            <h3>{categoryLabel(report.category)}</h3>
                            <p className={styles.quote}>{report.description}</p>

                            <dl>
                                <dt>Denunciada</dt>
                                <dd>{report.reported_username ? `@${report.reported_username}` : 'Não informada'}</dd>

                                <dt>Enviada por</dt>
                                <dd title={reporterName}>{reporterName}</dd>

                                <dt>Data</dt>
                                <dd>{formatDate(report.created_at)}</dd>
                            </dl>

                            <Button
                                variant={open ? 'brand' : 'outline'}
                                icon={open ? Check : RotateCcw}
                                fullWidth
                                disabled={busyId === report.id}
                                aria-busy={busyId === report.id}
                                onClick={() => toggle(report)}
                            >
                                {open ? 'Marcar como resolvida' : 'Reabrir'}
                            </Button>
                        </li>
                    );
                })}
            </ul>
        </>
    );
}
