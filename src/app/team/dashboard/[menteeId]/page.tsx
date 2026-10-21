import type { Metadata } from 'next';

import {
    ArrowLeft, Award, CalendarDays, CheckLine, Flame, MessageCircle,
    Route, ScrollText, Sparkles, Target, UserRoundCheck,
} from 'lucide-react';

import AttendanceChart from '#/components/AttendanceChart/AttendanceChart';
import Avatar from '#/components/Avatar/Avatar';
import { Button } from '#/components/Button/Button';
import ContributionCalendar from '#/components/ContributionCalendar/ContributionCalendar';
import PageHeader from '#/components/Header/PageHeader';
import StatCard from '#/components/StatCard/StatCard';
import XpChart from '#/components/XpChart/XpChart';
import XpDailyChart from '#/components/XpDailyChart/XpDailyChart';
import { getMenteeDashboard } from '#/utils/dashboardData';
import { todayInSaoPaulo } from '#/utils/dates';

import styles from './page.module.scss';

export const metadata: Metadata = {
    title: 'Painel da mentorada',
};

const statusLabel: Record<string, string> = {
    presente: 'Presente',
    falta: 'Falta',
    justificada: 'Justificada',
};

const certificateLabel: Record<string, string> = {
    pending_signature: 'Aguardando assinatura',
    signed: 'Assinado',
};

const dayCount = (count: number) => `${count} ${count === 1 ? 'dia' : 'dias'}`;

const formatDate = (date: string) =>
    new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

export default async function MenteeDashboardPage({ params }: { params: Promise<{ menteeId: string }> }) {
    const { menteeId } = await params;
    const data = await getMenteeDashboard(menteeId);

    const { mentee } = data;
    const firstName = mentee.name.trim().split(/\s+/)[0];
    const { attendance } = data;

    return (
        <>
            <PageHeader
                title={firstName}
                action={{ href: '/team/dashboard', label: 'Voltar ao painel', icon: ArrowLeft }}
            />

            <main className='main-tabs' aria-label={`Painel da ${mentee.name}`}>
                <section className={styles.identity} aria-label='Mentorada'>
                    <Avatar name={mentee.name} url={mentee.avatarUrl} size='lg'/>

                    <div className={styles.name}>
                        <h2>{mentee.name}</h2>
                        <span>@{mentee.username}</span>
                        <span>{mentee.trailName ?? 'Sem trilha'}</span>
                    </div>

                    <Button href={`/team/dashboard/${mentee.id}/trail`} variant='gold' icon={Route} fullWidth>
                        Ver Trilha
                    </Button>

                    <Button variant='brand' icon={MessageCircle} fullWidth>
                        Entrar em contato
                    </Button>
                </section>

                <section className={styles.section} aria-labelledby='summary-title'>
                    <h2 id='summary-title'><ScrollText aria-hidden='true'/>Resumo</h2>

                    <div className={styles.squares}>
                        <StatCard square tone='xp' icon={Sparkles} label='XP total' value={data.xpAllTrails}/>
                        <StatCard square tone='xp' icon={Sparkles} label='XP da trilha' value={data.xpTrail}/>
                        <StatCard
                            square
                            tone='streak'
                            icon={Flame}
                            label='Dias de ofensiva'
                            value={data.streak ? dayCount(data.streak) : 'Sem ofensiva'}
                        />
                        <StatCard
                            square
                            tone='streak'
                            icon={Flame}
                            label='Recorde de ofensiva'
                            value={data.streakRecord ? dayCount(data.streakRecord) : 'Sem recorde'}
                        />
                        <StatCard
                            square
                            icon={UserRoundCheck}
                            label='Presença'
                            value={attendance.rate === null ? 'Sem registros' : `${attendance.rate}%`}
                        />
                        <StatCard
                            square
                            tone='gold'
                            icon={Route}
                            label='Atividades dominadas'
                            value={data.masteredRate === null ? 'Sem atividades' : `${data.masteredRate}%`}
                        />
                        <StatCard
                            square
                            tone='danger'
                            icon={Target}
                            label='Média de acertos'
                            value={data.accuracy === null ? 'Nada' : `${data.accuracy}%`}
                        />
                        <StatCard
                            square
                            icon={CalendarDays}
                            label='Atividades por dia'
                            value={data.activitiesPerDay === null
                                ? 'Sem atividade ainda'
                                : data.activitiesPerDay.toLocaleString('pt-BR')}
                        />
                    </div>
                </section>

                <section className={styles.section} aria-labelledby='xp-title'>
                    <h2 id='xp-title'><Sparkles aria-hidden='true'/>XP Total</h2>

                    {data.xpSeries.length
                        ? <XpChart data={data.xpSeries}/>
                        : <p className={styles.empty}>Ainda não há XP registrado.</p>}
                </section>

                <section className={styles.section} aria-labelledby='xp-daily-title'>
                    <h2 id='xp-daily-title'><Sparkles aria-hidden='true'/>XP Por dia</h2>

                    {data.xpDaily.length
                        ? <XpDailyChart data={data.xpDaily}/>
                        : <p className={styles.empty}>Ainda não há XP registrado.</p>}
                </section>

                <section className={styles.section} aria-labelledby='attendance-title'>
                    <h2 id='attendance-title'><CheckLine className={styles.check} aria-hidden='true'/>Presença</h2>

                    {attendance.registered ? (
                        <>
                            <AttendanceChart
                                present={attendance.present}
                                absent={attendance.absent}
                                justified={attendance.justified}
                                rate={attendance.rate!}
                            />

                            <ul className={styles.recent} aria-label='Últimas atividades'>
                                {data.recent.map((item) => (
                                    <li key={`${item.date}-${item.title}`}>
                                        <span>{item.title}</span>
                                        <span>{formatDate(item.date)} · {statusLabel[item.status] ?? item.status}</span>
                                    </li>
                                ))}
                            </ul>
                        </>
                    ) : (
                        <p className={styles.empty}>Ainda não há presenças registradas.</p>
                    )}
                </section>

                <section className={styles.section} aria-labelledby='calendar-title'>
                    <h2 id='calendar-title'><CalendarDays aria-hidden='true'/>Atividades por dia</h2>

                    <ContributionCalendar days={data.days} today={todayInSaoPaulo()}/>
                </section>

                <section className={styles.section} aria-labelledby='progress-title'>
                    <h2 id='progress-title'><Route aria-hidden='true'/>Progresso na trilha</h2>

                    <div className={styles.cards}>
                        <StatCard
                            icon={Route}
                            label='Atividades dominadas'
                            value={`${data.progress.mastered} de ${data.progress.total}`}
                        />
                        <StatCard
                            icon={Award}
                            label='Certificado'
                            value={data.certificateStatus
                                ? certificateLabel[data.certificateStatus] ?? data.certificateStatus
                                : 'Ainda não gerado'}
                        />
                    </div>
                </section>
            </main>
        </>
    );
}
