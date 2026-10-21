import type { Metadata } from 'next';

import { Flame, Settings, Sparkles, UserRoundCheck, UsersRound } from 'lucide-react';

import DashboardMentees from '#/components/DashboardMentees/DashboardMentees';
import PageHeader from '#/components/Header/PageHeader';
import StatCard from '#/components/StatCard/StatCard';
import { getDashboardOverview } from '#/utils/dashboardData';

import styles from './page.module.scss';

export const metadata: Metadata = {
    title: 'Painel',
};

export default async function DashboardPage() {
    const { mentees, xpTotal, averageRate, withoutStreak } = await getDashboardOverview();

    return (
        <>
            <PageHeader
                title='Painel'
                action={{ href: '/team/settings', label: 'Configurações', icon: Settings }}
            />

            <main className='main-tabs' aria-label='Painel da mentora'>
                <section className={styles.section} aria-labelledby='summary-title'>
                    <h2 id='summary-title'>Resumo</h2>

                    <div className={styles.cards}>
                        <StatCard icon={UsersRound} label='Mentoradas' value={mentees.length}/>
                        <StatCard icon={Sparkles} label='XP somado' value={xpTotal}/>
                        <StatCard
                            icon={UserRoundCheck}
                            label='Presença média'
                            value={averageRate === null ? 'Sem registros' : `${averageRate}%`}
                        />
                        <StatCard icon={Flame} label='Sem ofensiva' value={withoutStreak}/>
                    </div>
                </section>

                <section className={styles.section} aria-labelledby='mentees-title'>
                    <h2 id='mentees-title'>Suas mentoradas</h2>

                    <DashboardMentees mentees={mentees}/>
                </section>
            </main>
        </>
    );
}
