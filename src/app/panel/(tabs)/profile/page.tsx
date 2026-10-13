import type { Metadata } from 'next';
import Link from 'next/link';

import { Award, Flame, Flower, Pencil, Settings, Sparkles, TerminalSquare } from 'lucide-react';

import CommunitySection from '#/components/CommunitySection/CommunitySection';
import PageHeader from '#/components/Header/PageHeader';
import PressableBase from '#/components/PressableBase/PressableBase';

import { people, stats } from '#/app/panel/mockData';

import styles from './page.module.scss';

export const metadata: Metadata = {
    title: 'Perfil',
};

export default function ProfilePage() {
    const statsCards = [
        { variant: 'streak', icon: Flame,    value: stats.streak,   label: 'dias de ofensiva'},
        { variant: 'xp',     icon: Sparkles, value: stats.totalXp,  label: 'total de XP'     },
        { variant: 'trail',  icon: Flower,   value: 'Dandelion',    label: 'Trilha'          },
        { variant: 'awards', icon: Award,    value: 'Nenhum',       label: 'certificado :('  },
    ];

    return (
        <>
            <PageHeader
                title='Perfil'
                action={{ href: '/panel/settings', label: 'Configurações', icon: Settings }}
            />

            <main
                className={styles.profile}
                aria-label='Meu Perfil'
            >
                <div className={styles.calling}>
                    <h2>Oi, Anne! <span aria-hidden='true'>👋</span></h2>
                    <div className={styles.action}>
                        <span>Bora codar no </span>
                        <PressableBase color='var(--color-brand-darker)' radius='.8rem'>
                            <Link
                                href='/panel/terminal'
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
                    <h2 className={styles.fullName}>Anne Franco</h2>
                    <p className={styles.username}>anne.franco26</p>
                    <p className={styles.journey}>Começou sua jornada em outrubro de 2026</p>
                    <p className={styles.paths}>Nenhuma trilha concluída ainda <span aria-hidden='true'>:(</span></p>
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