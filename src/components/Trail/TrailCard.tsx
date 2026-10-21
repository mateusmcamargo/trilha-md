import { Flower } from 'lucide-react';

import PressableBase from '#/components/PressableBase/PressableBase';

import styles from './TrailCard.module.scss';

interface TrailCardProps {
    name: string;
    subtitle: string | null;
    progress: number;
}

export default function TrailCard({ name, subtitle, progress }: TrailCardProps) {
    return (
        <PressableBase color='var(--color-brand-darker)' depth={8} radius='1rem'>
            <section className={styles.card}>

                <div className={styles.trailInfo}>
                    <div className={styles.trailTitle}>
                        <Flower/>
                        <h1>Trilha {name}</h1>
                    </div>
                    {subtitle && <h2>{subtitle}</h2>}
                </div>

                <div className={styles.trailProgress}>

                    <div
                        className={styles.progressTrack}
                        role='progressbar'
                        aria-label='Progresso da trilha'
                        aria-valuenow={progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                    >
                        <div
                            className={styles.progressFill}
                            style={{
                                width: `${progress}%`,
                            }}
                        />
                    </div>
                </div>
            </section>
        </PressableBase>
    );
}
