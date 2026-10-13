'use client';

import Link from 'next/link';
import { useState, type KeyboardEvent } from 'react';

import styles from './CommunitySection.module.scss';

type PeopleTabs = 'mentors' | 'friends';

interface Person {
    id: string;
    name: string;
    xp: number;
}

interface CommunitySectionProps {
    people: Record<PeopleTabs, Person[]>;
}

const peopleTabs = [
    { key: 'mentors', label: 'Tutoras' },
    { key: 'friends', label: 'Amigas'  },
] as const;

export default function CommunitySection({ people }: CommunitySectionProps) {
    const [activePeopleTab, setActivePeopleTab] = useState<PeopleTabs>('mentors');

    const handlePeopleTabKeyDown = (event: KeyboardEvent) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

        const next = activePeopleTab === 'mentors' ? 'friends' : 'mentors';

        setActivePeopleTab(next);
        document.getElementById(`tab-${next}`)?.focus();
    };

    return (
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
    );
}