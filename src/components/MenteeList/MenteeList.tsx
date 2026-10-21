'use client';

import { useState } from 'react';

import { CircleOff, Flame, GraduationCap, LayoutDashboard, Route, Sparkles, UserRound } from 'lucide-react';

import Avatar from '#/components/Avatar/Avatar';
import { Badge } from '#/components/Badge/Badge';
import { AdoptButton } from '#/components/Button/AdoptButton';
import { Button } from '#/components/Button/Button';
import { ReleaseButton } from '#/components/Button/ReleaseButton';
import DataList, { type Column } from '#/components/DataList/DataList';
import { Modal } from '#/components/Modal/Modal';
import TruncatedName from '#/components/TruncatedName/TruncatedName';
import type { MenteeItem } from '#/utils/teamData';

import styles from './MenteeList.module.scss';

interface MenteeListProps {
    mine: MenteeItem[];
    all: MenteeItem[];
}

const firstName = (person: { name: string }) => person.name.trim().split(/\s+/)[0];

export default function MenteeList({ mine, all }: MenteeListProps) {
    const [selected, setSelected] = useState<MenteeItem | null>(null);

    const trailName = (mentee: MenteeItem) => mentee.enrollment?.trailName ?? 'Sem trilha';

    // 0 = available for adoption, 1 = adopted by me, 2 = unavailable
    const mineIds = new Set(mine.map((mentee) => mentee.id));
    const adoption = (mentee: MenteeItem) => {
        if (mineIds.has(mentee.id)) return 1;
        return mentee.enrollment && !mentee.enrollment.mentor ? 0 : 2;
    };

    const searchText = (mentee: MenteeItem) => [
        mentee.name,
        mentee.username,
        trailName(mentee),
        mentee.enrollment?.mentor?.name ?? 'Nenhuma',
    ].join(' ');

    const avatarButton =(mentee: MenteeItem) => (
        <button
            type='button'
            className={styles.avatarButton}
            aria-haspopup='dialog'
            aria-label={`Ver perfil de ${mentee.name}`}
            onClick={() => setSelected(mentee)}
        >
            <Avatar name={mentee.name} url={mentee.avatarUrl} size='sm'/>
        </button>
    );

    const nameColumn: Column<MenteeItem> = {
        key: 'name',
        label: 'Nome',
        shrink: true,
        sortValue: (mentee) => mentee.name,
        render: (mentee) => (
            <div className={styles.person}>
                {avatarButton(mentee)}

                <div className={styles.details}>
                    <h3><TruncatedName fullName={mentee.name}>{mentee.name}</TruncatedName></h3>
                    <span>{trailName(mentee)}</span>
                </div>
            </div>
        ),
    };

    const mentorColumn: Column<MenteeItem> = {
        key: 'mentor',
        label: 'Mentora',
        sortValue: adoption,
        render: (mentee) => mentee.enrollment?.mentor ? (
            <Badge
                variant='mentor'
                label={
                    <TruncatedName fullName={mentee.enrollment.mentor.name}>
                        {mentee.enrollment.mentor.name}
                    </TruncatedName>
                }
            />
        ) : (
            <Badge variant='none' label='Nenhuma'/>
        ),
    };

    const mineColumns: Column<MenteeItem>[] = [
        nameColumn,
        {
            key: 'actions',
            label: 'Ações',
            width: '1%',
            render: (mentee) => (
                <div className={styles.actions}>
                    <Button
                        href={`/team/dashboard/${mentee.id}`}
                        variant='outline'
                        icon={LayoutDashboard}
                        depth={4}
                        aria-label={`Abrir ${mentee.name} no painel`}
                    />
                </div>
            ),
        },
    ];

    const allColumns: Column<MenteeItem>[] = [
        nameColumn,
        mentorColumn,
        {
            key: 'actions',
            label: 'Ações',
            width: '1%',
            render: (mentee) => (
                <div className={styles.actions}>
                    {mentee.enrollment && !mentee.enrollment.mentor && (
                        <AdoptButton
                            variant='icon'
                            enrollmentId={mentee.enrollment.id}
                            menteeName={mentee.name}
                        />
                    )}

                    {mineIds.has(mentee.id) && mentee.enrollment && (
                        <ReleaseButton
                            variant='icon'
                            enrollmentId={mentee.enrollment.id}
                            menteeName={mentee.name}
                        />
                    )}

                    {adoption(mentee) === 2 && (
                        <Button
                            icon={CircleOff}
                            depth={4}
                            disabled
                            aria-label='Nenhuma ação disponível'
                        />
                    )}
                </div>
            ),
        },
    ];

    return (
        <>
            <section className={styles.section} aria-labelledby='mine-title'>
                <h2 id='mine-title'>Suas mentoradas</h2>

                <DataList
                    label='Suas mentoradas'
                    searchText={searchText}
                    rows={mine}
                    columns={mineColumns}
                    getKey={(mentee) => mentee.id}
                    defaultSort={{ key: 'name', direction: 'asc' }}
                    emptyMessage='Você ainda não tem mentoradas. Adote uma na lista abaixo!'
                />
            </section>

            <section className={styles.section} aria-labelledby='all-title'>
                <h2 id='all-title'>Todas as mentoradas</h2>

                <DataList
                    label='Todas as mentoradas'
                    searchText={searchText}
                    rows={all}
                    columns={allColumns}
                    getKey={(mentee) => mentee.id}
                    defaultSort={{ key: 'mentor', direction: 'asc' }}
                    emptyMessage='Nenhuma mentorada cadastrada ainda.'
                />
            </section>

            <Modal
                open={!!selected}
                onClose={() => setSelected(null)}
                icon={UserRound}
                title={selected ? `Perfil da ${firstName(selected)}` : 'Perfil da mentorada'}
                actions={selected?.enrollment && (
                    adoption(selected) === 0 ? (
                        <AdoptButton
                            enrollmentId={selected.enrollment.id}
                            menteeName={selected.name}
                            onDone={() => setSelected(null)}
                        />
                    ) : adoption(selected) === 1 ? (
                        <ReleaseButton
                            enrollmentId={selected.enrollment.id}
                            menteeName={selected.name}
                            onDone={() => setSelected(null)}
                        />
                    ) : (
                        <p className={styles.adopted}>A {firstName(selected)} já foi adotada!</p>
                    )
                )}
            >
                {selected && (
                    <div className={styles.profile}>
                        <Avatar name={selected.name} url={selected.avatarUrl} size='lg'/>

                        <div className={styles.identity}>
                            <h3>{selected.name}</h3>
                            <span>@{selected.username}</span>
                        </div>

                        <dl className={styles.info}>
                            <div className={styles.trail}>
                                <Route aria-hidden='true'/>
                                <dt>Trilha</dt>
                                <dd>{trailName(selected)}</dd>
                            </div>
                            {selected.enrollment && (
                                <div className={styles.xp}>
                                    <Sparkles aria-hidden='true'/>
                                    <dt>XP na trilha</dt>
                                    <dd>{selected.xp}</dd>
                                </div>
                            )}
                            <div className={styles.streak}>
                                <Flame aria-hidden='true'/>
                                <dt>Ofensiva</dt>
                                <dd>{selected.streak ?? '—'}</dd>
                            </div>
                            <div className={styles.mentor}>
                                <GraduationCap aria-hidden='true'/>
                                <dt>Mentora</dt>
                                <dd>{selected.enrollment?.mentor?.name ?? 'Nenhuma'}</dd>
                            </div>
                        </dl>
                    </div>
                )}
            </Modal>
        </>
    );
}
