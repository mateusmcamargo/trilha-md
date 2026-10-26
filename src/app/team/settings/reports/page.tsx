import type { Metadata } from 'next';

import { AbuseReportList, type AbuseReport } from '#/components/Settings/AbuseReportList';
import { SettingsPage } from '#/components/Settings/SettingsPage';

import { mockAbuseReports } from '#/utils/mockData';
import { isMockMode } from '#/utils/mockMode';
import { isSkeletonPreview } from '#/utils/skeletonPreview';
import { createClient } from '#/utils/supabase/server';

import ReportsLoading from './loading';

import styles from '#/components/Settings/Settings.module.scss';

export const metadata: Metadata = {
    title: 'Denúncias de abuso',
};

// moderation data: any mentor reads it (RLS)
async function getAbuseReports(): Promise<AbuseReport[]> {
    if (isMockMode) return mockAbuseReports;

    const supabase = await createClient();
    const { data, error } = await supabase
        .from('abuse_reports')
        .select('*, reporter:profiles!abuse_reports_reporter_id_fkey(full_name, username)')
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
}

export default async function ReportsPage() {
    // demo mode with the data turned off
    if (await isSkeletonPreview()) return <ReportsLoading/>;

    const reports = await getAbuseReports();
    const openCount = reports.filter((report) => report.status === 'aberta').length;

    return (
        <SettingsPage title='Denúncias' backHref='/team/settings'>
            <section className={styles.section}>
                <h2>Todas as denúncias</h2>
                <p>
                    {openCount === 0
                        ? 'Nenhuma denúncia aberta.'
                        : openCount === 1 ? '1 denúncia aberta.' : `${openCount} denúncias abertas.`}
                    {' '}Todas as mentoras veem esta lista. Trate os casos com cuidado e fale com a
                    coordenação do projeto quando precisar.
                </p>

                <AbuseReportList reports={reports}/>
            </section>
        </SettingsPage>
    );
}
