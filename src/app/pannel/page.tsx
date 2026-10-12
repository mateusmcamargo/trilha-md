'use client';

import { Badge } from '#/components/Badge/Badge';
import Trail from '#/components/Trail/Trail';
import { Dumbbell, FileText, Flame, Flower, Heart, Icon, Pencil, Route, Sparkles, Terminal, TerminalSquare, TerminalSquareIcon, TrendingUp, Venus } from 'lucide-react';
import styles from './page.module.scss';
import { useState } from 'react';
import PressableBase from '#/components/PressableBase/PressableBase';

type Page = 'trail' | 'terminal' | 'practice' | 'files' | 'progress' | 'profile';

const navItems = [
    { page: 'trail',    icon: Route,          label: 'Trilha'    },
    { page: 'terminal', icon: TerminalSquare, label: 'Terminal'  },
    { page: 'practice', icon: Dumbbell,       label: 'Praticar'  },
    { page: 'files',    icon: FileText,       label: 'Materiais' },
    { page: 'progress', icon: TrendingUp,     label: 'Progresso' },
] as const;

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


export default function page() {

    const [activePage, setActivePage] = useState<string>('profile');

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

            {activePage === 'trail' ? (
                <main
                    className={styles.trail}
                    aria-label='Atividades da minha trilha'
                >

                    <PressableBase color='var(--color-purple-900)' radius='1rem'>
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

                    <section className={styles.trailPath}>
                        <Trail items={trailItems}/>
                    </section>
                </main>
            ) : activePage === 'profile' ? (
                <main
                    className={styles.profile}
                    aria-label='Meu Perfil'
                >
                    <div className={styles.calling}>
                        <h2>Oi, Anne! 👋</h2>
                        <div className={styles.action}>
                            <span>Bora codar no </span>
                            <PressableBase color='var(--color-purple-900)' radius='.8rem'>
                                <button
                                    className={styles.actionButton}
                                    onClick={() => setActivePage('terminal')}
                                    >
                                    <TerminalSquare/>
                                    <span>Terminal</span>
                                </button>
                            </PressableBase>
                            <span>?</span>
                        </div>
                    </div>

                    <div className={styles.avatarBig}>
                        <PressableBase color='var(--color-purple-900)' radius='.8rem'>
                            <button className={styles.edit}>
                                <Pencil/>
                            </button>
                        </PressableBase>
                    </div>

                    <div className={styles.userInfo}>
                        <h3 className={styles.fullName}>Anne Franco</h3>
                        <p className={styles.username}>anne.franco26</p>
                        <p className={styles.journey}>Começou sua trilha em outrubro de 2026</p>
                        <p className={styles.paths}>Nenhuma trilha concluída ainda :(</p>
                    </div>
                </main>
            ) : (
                <></>
            )}

            <footer className={styles.footer}>
                {navItems.map(({ page, icon: Icon, label }) => (
                    <button
                        key={page}
                        type='button'
                        className={`${styles.navButton} ${activePage === page ? styles.active : ''}`}
                        onClick={() => setActivePage(page)}
                        aria-label={label}
                        aria-current={activePage === page ? 'page' : undefined}
                    >
                        <Icon/>
                    </button>
                ))}
                <button
                    type='button'
                    className={`${styles.avatar} ${activePage === 'profile' ? styles.active : ''}`}
                    onClick={() => setActivePage('profile')}
                    aria-label='Meu perfil'
                    aria-current={activePage === 'profile' ? 'page' : undefined}
                >
                    <span>AF</span>
                </button>
            </footer>
        </div>
    );
}