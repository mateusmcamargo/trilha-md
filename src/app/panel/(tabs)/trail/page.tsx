import type { Metadata } from 'next';

import { Flower } from 'lucide-react';

import PressableBase from '#/components/PressableBase/PressableBase';
import StatsHeader from '#/components/Header/StatsHeader';
import Trail from '#/components/Trail/Trail';

import styles from './page.module.scss';
import { getPanelData } from '#/utils/panelData';

export const metadata: Metadata = {
    title: 'Trilha',
};

export default async function TrailPage() {

    const { stats, trail, trailItems, trailProgress } = await getPanelData();

        if (!trail) {
            return (
                <>
                    <StatsHeader/>

                    <main
                        className={styles.trail}
                        aria-label='Atividades da minha trilha'
                    >
                        <h1>Nenhuma trilha ativa</h1>
                        <p>Você ainda não está matriculada em uma trilha.</p>
                    </main>
                </>
            );
        }

    return (
        <>
            <StatsHeader/>

            <main
                className={`main-tabs ${styles.trail}`}
                aria-label='Atividades da minha trilha'
            >

                <PressableBase color='var(--color-brand-darker)' depth={8} radius='1rem'>
                    <section className={styles.trailCard}>

                        <div className={styles.trailInfo}>
                            <div className={styles.trailTitle}>
                                <Flower/>
                                <h1>Trilha {trail.name}</h1>
                            </div>
                            <h2>{trail.subtitle}</h2>
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