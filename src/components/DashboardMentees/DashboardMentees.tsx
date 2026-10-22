'use client';

import { Flame, LayoutDashboard, Sparkles } from 'lucide-react';

import Avatar from '#/components/Avatar/Avatar';
import { Button } from '#/components/Button/Button';
import DataList, { type Column } from '#/components/DataList/DataList';
import TruncatedName from '#/components/TruncatedName/TruncatedName';
import type { DashboardMentee } from '#/utils/dashboardData';

import styles from './DashboardMentees.module.scss';

// attendance rate (%): below the minimum is danger, below the good mark is warning
const MIN_ATTENDANCE  = 60;
const GOOD_ATTENDANCE = 75;

const attendanceLevel = (rate: number) =>
    rate < MIN_ATTENDANCE ? 'danger' : rate < GOOD_ATTENDANCE ? 'warning' : 'success';

const columns: Column<DashboardMentee>[] = [
    {
        key: 'name',
        label: 'Nome',
        shrink: true,
        sortValue: (mentee) => mentee.name,
        render: (mentee) => (
            <div className={styles.person}>
                <Avatar name={mentee.name} url={mentee.avatarUrl} size='sm'/>

                <div className={styles.details}>
                    <h3><TruncatedName fullName={mentee.name}>{mentee.name}</TruncatedName></h3>
                    <div className={styles.stats}>
                        <span className={styles.xp}>
                            <Sparkles aria-hidden='true'/>
                            <span className='sr-only'>XP: </span>
                            {mentee.xp}
                        </span>

                        <span className={styles.streak}>
                            <Flame aria-hidden='true'/>
                            <span className='sr-only'>Ofensiva: </span>
                            {mentee.streak ?? 0}
                        </span>
                    </div>
                </div>
            </div>
        ),
    },
    {
        key: 'rate',
        label: 'Presença',
        compact: true,
        sortValue: (mentee) => mentee.rate ?? -1,
        render: (mentee) => mentee.rate === null ? (
            <span className={styles.muted}>Sem registros</span>
        ) : (
            <div className={styles.rate}>
                <span className={mentee.rate < MIN_ATTENDANCE ? styles.low : undefined}>
                    {mentee.rate}%
                    {mentee.rate < MIN_ATTENDANCE && <span className='sr-only'> (baixa)</span>}
                </span>

                <div className={styles.bar} aria-hidden='true'>
                    <div className={styles[attendanceLevel(mentee.rate)]} style={{ width: `${mentee.rate}%` }}/>
                </div>
            </div>
        ),
    },
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

const searchText = (mentee: DashboardMentee) => [mentee.name, mentee.username].join(' ');

export default function DashboardMentees({ mentees }: { mentees: DashboardMentee[] }) {
    return (
        <DataList
            label='Suas mentoradas'
            searchText={searchText}
            rows={mentees}
            columns={columns}
            getKey={(mentee) => mentee.id}
            defaultSort={{ key: 'rate', direction: 'asc' }}
            emptyMessage='Você ainda não tem mentoradas. Adote uma na aba Meninas!'
        />
    );
}
