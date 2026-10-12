'use client';

import { Badge } from '#/components/Badge/Badge';
import Trail from '#/components/Trail/Trail';
import { Dumbbell, FileText, Flame, Flower, Heart, Route, Sparkles, Terminal, TerminalSquare, TerminalSquareIcon, TrendingUp, Venus } from 'lucide-react';
import styles from './page.module.scss';

const trailItems = [
    {
        id: '1',
        title: 'Boas-vindas',
        status: 'mastered' as const,
        progress: 100,
    },
    {
        id: '2',
        title: 'Tecnologia',
        status: 'mastered' as const,
        progress: 100,
    },
    {
        id: '3',
        title: 'Programação',
        status: 'mastered' as const,
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
        status: 'locked' as const,
        progress: 0,
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

    const spark_count = 4;
    const life = 5;
    const xp = 240;

    return (
        <div className={styles.page}>
            <header className={styles.header}>

                <div className={styles.trailInfo}>
                    <Badge
                        icon={Flower}
                        variant='trail'
                        label={`${progress.toString()} %`}
                    />
                </div>

                <div className={styles.progressInfo}>
                    <Badge
                        icon={Sparkles}
                        variant='xp'
                        label={xp.toString()}
                    />
                    <Badge
                        icon={Flame}
                        variant='spark'
                        label={spark_count.toString()}
                    />
                    <Badge
                        icon={Heart}
                        variant='life'
                        label={life.toString()}
                    />
                </div>
            </header>

            <main
                className={styles.trail}
                aria-label="Atividades da minha trilha"
            >

                <section className={styles.trailCard}>

                    <div className={styles.trailInfo}>
                        <div className={styles.trailTitle}>
                            <Flower/>
                            <h1>Trilha Dente-de-Leão</h1>
                        </div>
                        <h2>Como a internet funciona</h2>
                    </div>

                    <div className={styles.trailProgress}>

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
                </section>

                <section className={styles.trailPath}>
                    <Trail items={trailItems}/>
                </section>
            </main>

            <footer className={styles.footer}>
                <Badge
                    icon={Route}
                    variant='page'
                    isActive={true}
                />
                <Badge
                    icon={TerminalSquare}
                    variant='page'
                />
                <Badge
                    icon={Dumbbell}
                    variant='page'
                />
                <Badge
                    icon={FileText}
                    variant='page'
                />
                <Badge
                    icon={TrendingUp}
                    variant='page'
                />
                <div className={styles.userInfo}>
                    <div className={styles.avatar}>
                        <span>AF</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}