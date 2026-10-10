'use client';

import { LogoutButton } from '#/components/button/LogoutButton';
import Trail from '#/components/Trail/Trail';
import styles from './page.module.scss';

const trailItems = [
    {
        id: '1',
        title: 'Boas-vindas',
        status: 'completed' as const,
    },
    {
        id: '2',
        title: 'Tecnologia',
        status: 'completed' as const,
    },
    {
        id: '3',
        title: 'Programação',
        status: 'available' as const,
    },
    {
        id: '4',
        title: 'Web',
        status: 'locked' as const,
    },
    {
        id: '5',
        title: 'Projeto',
        status: 'locked' as const,
    },
    {
        id: '6',
        title: 'Desafio',
        status: 'locked' as const,
    },
    {
        id: '7',
        title: 'Conclusão',
        status: 'locked' as const,
    },
];

export default function TutorandaPage() {
    const completed = trailItems.filter(
        (item) => item.status === 'completed'
    ).length;

    const progress = Math.round(
        (completed / trailItems.length) * 100
    );

    return (
        <main className={styles.page}>
            {/* Cabeçalho */}
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.heading}>
                        <h1 className={styles.headingTitle}>
                            Minha trilha
                        </h1>

                        <p className={styles.headingDescription}>
                            Continue sua jornada na tecnologia
                        </p>

                        <LogoutButton/>
                    </div>

                    <div className={styles.progress}>
                        <span className={styles.progressLabel}>
                            {progress}%
                        </span>

                        <div
                            className={styles.progressTrack}
                            role="progressbar"
                            aria-label="Progresso da trilha"
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
                </div>
            </header>

            {/* Área da trilha */}
            <section
                className={styles.trailSection}
                aria-label="Atividades da minha trilha"
            >
                <Trail items={trailItems} />
            </section>
        </main>
    );
}