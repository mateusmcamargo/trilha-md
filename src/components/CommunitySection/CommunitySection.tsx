'use client';

import Link from 'next/link';
import { useState, type KeyboardEvent } from 'react';

import { getInitials } from '#/utils/getInitials';

import { ChooseMentorButton } from '../Button/ChooseMentorButton';
import TruncatedName from '../TruncatedName/TruncatedName';

import styles from './CommunitySection.module.scss';

type PeopleTabs = 'mentors' | 'friends';

interface Person {
    id: string;
    name: string;
    xp?: number;
}

interface CommunitySectionProps {
    // mentorChoices: null when she can't choose a mentor right now
    people: Record<PeopleTabs, Person[]> & { mentorChoices: Person[] | null };
}

const peopleTabs = [
    { key: 'mentors', label: 'Mentoras' },
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

    const emptyMessage: Record<PeopleTabs, string> = {
        mentors: people.mentorChoices
            ? 'Você ainda não tem mentora.'
            : 'Entre em uma trilha para ter uma mentora.',
        friends: 'Você ainda não tem amigas. Toque em Adicionar amigas para começar!',
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
                    aria-label='Mentoras ou amigas'
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
                    {people[activePeopleTab].length === 0 ? (
                        <div className={styles.empty}>
                            <p>{emptyMessage[activePeopleTab]}</p>

                            {activePeopleTab === 'mentors' && people.mentorChoices && (
                                <ChooseMentorButton mentors={people.mentorChoices}/>
                            )}
                        </div>
                    ) : (
                        <ul className={styles.list}>
                            {people[activePeopleTab].map(({ id, name, xp }) => (
                                <li key={id} className={styles.person}>
                                    <div className={styles.photo} aria-hidden='true'>
                                        <span>{getInitials(name)}</span>
                                    </div>
                                    <div className={styles.details}>
                                        <h3><TruncatedName fullName={name}>{name}</TruncatedName></h3>
                                        {xp !== undefined && <span>{xp} XP</span>}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </section>
    );
}