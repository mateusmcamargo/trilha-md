'use client';

import { LogoutButton } from '#/components/button/LogoutButton';
import Trail from '#/components/Trail/Trail';
import styles from './page.module.scss';



const trailItems = [
    {
        id: '1',
        title: 'Boas-vindas',
        status: 'completed' as const,
        progress: 100,
    },
    {
        id: '2',
        title: 'Tecnologia',
        status: 'completed' as const,
        progress: 100,
    },
    {
        id: '3',
        title: 'Programação',
        status: 'completed' as const,
        progress: 100,
    },
    {
        id: '4',
        title: 'Web',
        status: 'completed' as const,
        progress: 100,
    },
    {
        id: '5',
        title: 'Projeto',
        status: 'completed' as const,
        progress: 100,
    },
    {
        id: '6',
        title: 'Desafio',
        status: 'completed' as const,
        progress: 100,
    },
    {
        id: '7',
        title: 'Conclusão',
        status: 'completed' as const,
        progress: 100,
    },
    {
        id: '8',
        title: 'Lógica de Programação',
        status: 'completed' as const,
        progress: 100,
    },
    {
        id: '9',
        title: 'Algoritmos',
        status: 'available' as const,
        progress: 65,
    },
    {
        id: '10',
        title: 'HTML e CSS',
        status: 'available' as const,
        progress: 30,
    },
    {
        id: '11',
        title: 'JavaScript',
        status: 'available' as const,
        progress: 10,
    },
    {
        id: '12',
        title: 'Git e GitHub',
        status: 'locked' as const,
        progress: 0,
    },
    {
        id: '13',
        title: 'Desenvolvimento Front-end',
        status: 'locked' as const,
        progress: 0,
    },
    {
        id: '14',
        title: 'Desenvolvimento Back-end',
        status: 'locked' as const,
        progress: 0,
    },
    {
        id: '15',
        title: 'Banco de Dados',
        status: 'locked' as const,
        progress: 0,
    },
    {
        id: '16',
        title: 'Design de Interfaces',
        status: 'locked' as const,
        progress: 0,
    },
    {
        id: '17',
        title: 'Trabalho em Equipe',
        status: 'locked' as const,
        progress: 0,
    },
    {
        id: '18',
        title: 'Desenvolvimento de Projeto',
        status: 'locked' as const,
        progress: 0,
    },
    {
        id: '19',
        title: 'Projeto Final',
        status: 'locked' as const,
        progress: 0,
    },
    {
        id: '20',
        title: 'Certificação',
        status: 'locked' as const,
        progress: 0,
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