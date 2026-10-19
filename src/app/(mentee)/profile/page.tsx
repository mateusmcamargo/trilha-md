import type { Metadata } from 'next';
import Link from 'next/link';

import { Award, Flame, Flower, Pencil, Settings, Sparkles, TerminalSquare } from 'lucide-react';

import CommunitySection from '#/components/CommunitySection/CommunitySection';
import PageHeader from '#/components/Header/PageHeader';
import PressableBase from '#/components/PressableBase/PressableBase';

import { getMenteeData } from '#/utils/menteeData';

import styles from './page.module.scss';

export const metadata: Metadata = {
    title: 'Perfil',
};

export default async function ProfilePage() {
    const { user, stats, trail, people, journeyStart, completedTrails, certificates } = await getMenteeData();
    const firstName = user.name.split(' ')[0];

    const statsCards = [
        { variant: 'streak', icon: Flame,    value: stats.streak,           label: 'dias de ofensiva'},
        { variant: 'xp',     icon: Sparkles, value: stats.totalXp,          label: 'total de XP'     },
        { variant: 'trail',  icon: Flower,   value: trail?.name ?? 'Nenhuma', label: 'Trilha'         },
        { variant: 'awards', icon: Award,    value: certificates || 'Nenhum',
            label: certificates === 0 ? 'certificado :(' : certificates === 1 ? 'certificado' : 'certificados' },
    ];

    return (
        <>
            <PageHeader
                title='Perfil'
                action={{ href: '/settings', label: 'Configurações', icon: Settings }}
            />

            <main
                className={`main-tabs ${styles.profile}`}
                aria-label='Meu Perfil'
            >
                <div className={styles.calling}>
                    <h2>Oi, {firstName}! <span aria-hidden='true'>👋</span></h2>
                    <div className={styles.action}>
                        <span>Bora codar no </span>
                        <PressableBase color='var(--color-brand-darker)' radius='.8rem'>
                            <Link
                                href='/terminal'
                                className={styles.actionButton}
                            >
                                <TerminalSquare aria-hidden='true'/>
                                <span>Terminal</span>
                            </Link>
                        </PressableBase>
                        <span>?</span>
                    </div>
                </div>

                <div className={styles.avatarBig}>
                    <PressableBase color='var(--color-brand-darker)' radius='.8rem'>
                        <button
                            type='button'
                            className={styles.edit}
                            aria-label='Editar avatar'
                        >
                            <Pencil aria-hidden='true'/>
                        </button>
                    </PressableBase>
                </div>

                <div className={styles.userInfo}>
                    {journeyStart && <p className={styles.journey}>Começou sua jornada em {journeyStart}</p>}
                    <p className={styles.paths}>
                        {completedTrails === 0
                            ? <>Nenhuma trilha concluída ainda <span aria-hidden='true'>:(</span></>
                            : `${completedTrails} ${completedTrails === 1 ? 'trilha concluída' : 'trilhas concluídas'}`}
                    </p>
                </div>

                <div className={styles.userStats}>
                    <h2>Estatísticas</h2>

                    <div className={styles.cards} role='list'>
                        {statsCards.map(({ variant, icon: Icon, value, label }) => (
                            <div
                                key={variant}
                                role='listitem'
                                className={`${styles.statsCard} ${styles[variant]}`}
                            >
                                <div className={styles.title}>
                                    <div className={styles.icon}>
                                        <Icon aria-hidden='true'/>
                                    </div>
                                    <p>{value}</p>
                                </div>
                                <div className={styles.content}>
                                    <span>{label}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <CommunitySection people={people}/>
            </main>
        </>
    );
}