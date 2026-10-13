'use client';

import styles from './page.module.scss';
import Link from 'next/link';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';

import { Award, Dumbbell, FileText, Flame, Flower, Heart, Pencil, Route, Sparkles, TerminalSquare, TrendingUp } from 'lucide-react';

import { Badge } from '#/components/Badge/Badge';
import Trail from '#/components/Trail/Trail';
import PressableBase from '#/components/PressableBase/PressableBase';
import CodeSandbox from '#/components/CodeSandbox/CodeSandbox';

type Page       = 'trail' | 'terminal' | 'practice' | 'files' | 'progress' | 'profile';
type PeopleTabs = 'mentors' | 'friends';


export default function page() {

    const [activePage, setActivePage]           = useState<Page>('profile');
    const [activePeopleTab, setActivePeopleTab] = useState<PeopleTabs>('mentors');
    const isFirstRender = useRef(true);
    const streak = 4;
    const life = 5;
    const xp = 240;
    const totalXp = 6430;

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        document.querySelector<HTMLElement>('main')?.focus();
    }, [activePage]);

    const handlePeopleTabKeyDown = (event: KeyboardEvent) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

        const next = activePeopleTab === 'mentors' ? 'friends' : 'mentors';

        setActivePeopleTab(next);
        document.getElementById(`tab-${next}`)?.focus();
    };

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

    const statsCards = [
        { variant: 'streak',  icon: Flame,    value: streak,           label: 'dias de ofensiva'          },
        { variant: 'xp',     icon: Sparkles, value: totalXp,          label: 'total de XP'               },
        { variant: 'trail',  icon: Flower,   value: 'Dandelion',  label: 'Trilha'                    },
        { variant: 'awards', icon: Award,    value: 'Nenhum',         label: 'certificado :(' },
    ];

    const people = {
        mentors: [
            { id: '1', name: 'Maria', xp: 25279 },
        ],
        friends: [
            { id: '2', name: 'Larinha', xp: 4987 },
            { id: '3', name: 'Mica',    xp: 3240 },
            { id: '4', name: 'Rebeca',  xp: 12574 },
        ],
    };

    const peopleTabs = [
        { key: 'mentors', label: 'Tutoras' },
        { key: 'friends', label: 'Amigas'  },
    ] as const;

    const completed = trailItems.filter(
        (item) => item.status === 'completed'
    ).length;

    const progress = Math.round(
        (completed / trailItems.length) * 100
    );

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
                        variant='streak'
                        label={streak.toString()}
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
                    tabIndex={-1}
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
                    tabIndex={-1}
                >
                    <div className={styles.calling}>
                        <h1>Oi, Anne! <span aria-hidden='true'>👋</span></h1>
                        <div className={styles.action}>
                            <span>Bora codar no </span>
                            <PressableBase color='var(--color-purple-900)' radius='.8rem'>
                                <button
                                    type='button'
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
                            <button
                                type='button'
                                className={styles.edit}
                                aria-label='Editar avatar'
                            >
                                <Pencil/>
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
                                        <Icon/>
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

                    <section className={styles.people} aria-labelledby='people-title'>
                        <div className={styles.header}>
                            <h2 id='people-title'>Comunidade</h2>
                            <Link href='/buscar'>Adicionar amigas</Link>
                        </div>

                        <div className={styles.box}>
                            <div
                                role='tablist'
                                aria-label='Tutoras ou amigas'
                                className={styles.peopleTabs}
                                onKeyDown={handlePeopleTabKeyDown}
                            >
                                {peopleTabs.map(({ key, label }) => (
                                    <button
                                        key={key}
                                        id={`tab-${key}`}
                                        type='button'
                                        role='tab'
                                        tabIndex={activePeopleTab === key ? 0 : -1}
                                        aria-selected={activePeopleTab === key}
                                        aria-controls='community-list'
                                        className={`${styles.peopleTab} ${activePeopleTab === key ? styles.active : ''}`}
                                        onClick={() => setActivePeopleTab(key)}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>

                            <div
                                id='community-list'
                                role='tabpanel'
                                aria-labelledby={`tab-${activePeopleTab}`}
                                tabIndex={0}
                            >
                                <ul className={styles.list}>
                                    {people[activePeopleTab].map(({ id, name, xp }) => (
                                        <li key={id} className={styles.person}>
                                            <div className={styles.photo} aria-hidden='true'>
                                                <span>{name.slice(0, 2).toUpperCase()}</span>
                                            </div>
                                            <div className={styles.details}>
                                                <h3>{name}</h3>
                                                <span>{xp} XP</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </section>
                </main>
            ) : activePage === 'terminal' ? (
                <main
                    className={styles.terminal}
                    aria-label='Terminal de código'
                    tabIndex={-1}
                >
                    <CodeSandbox/>
                </main>
            ) : (
                <main className={styles.notFound} tabIndex={-1}>
                    <h1>Ops! Não há nada aqui <span aria-hidden='true'>:(</span></h1>
                </main>
            )}

            <nav className={styles.footer} aria-label='Navegação principal'>
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
            </nav>
        </div>
    );
}