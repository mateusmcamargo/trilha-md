import type { Metadata } from 'next';

import { Flower } from 'lucide-react';

import PressableBase from '#/components/PressableBase/PressableBase';
import StatsHeader from '#/components/Header/StatsHeader';
import Trail from '#/components/Trail/Trail';

import { stats, trailItems, trailProgress } from '#/utils/mockData';

import styles from './page.module.scss';

export const metadata: Metadata = {
    title: 'Trilha',
};

export default function TrailPage() {
    return (
        <>
            <StatsHeader
                progress={trailProgress}
                xp={stats.xp}
                streak={stats.streak}
                life={stats.life}
            />

            <main
                className={styles.trail}
                aria-label='Atividades da minha trilha'
            >

                <PressableBase color='var(--color-brand-darker)' radius='1rem'>
                    <section className={styles.trailCard}>

                        <div className={styles.trailInfo}>
                            <div className={styles.trailTitle}>
                                <Flower/>
                                <h1>Trilha Dandelion</h1>
                            </div>
                            <h2>Como a internet funciona</h2>
                        </div>

                        <div className={styles.trailProgress}>

                            <div
                                className={styles.progressTrack}
                                role='progressbar'
                                aria-label='Progresso da trilha'
                                aria-valuenow={trailProgress}
                                aria-valuemin={0}
                                aria-valuemax={100}
                            >
                                <div
                                    className={styles.progressFill}
                                    style={{
                                        width: `${trailProgress}%`,
                                    }}
                                />
                            </div>
                        </div>
                    </section>
                </PressableBase>

                <section className={styles.trailPath}>
                    <Trail items={trailItems}/>
                </section>
            </main>
        </>
    );
}