'use client';

import type { CSSProperties } from 'react';

import { CalendarCheck, CalendarClock, CalendarDays, CalendarX } from 'lucide-react';

import PressableBase from '#/components/PressableBase/PressableBase';
import type { EventStatus, TrailBranch } from '#/utils/menteeData';

import styles from './TrailBranches.module.scss';

interface TrailBranchesProps {
    parentTitle: string;
    branches: TrailBranch[];
    // 1: right of the node, -1: left (the side with room, opposite to the wave)
    side: 1 | -1;
    readOnly?: boolean;
    onSelect: (id: string) => void;
}

// up to two nodes side by side; more than that, the second becomes a "+N" list
const MAX_VISIBLE = 2;

const statusInfo: Record<EventStatus, { icon: typeof CalendarDays; label: string; base: string }> = {
    upcoming: { icon: CalendarClock, label: 'em breve',               base: 'var(--color-node-base-available)' },
    today:    { icon: CalendarDays,  label: 'é hoje',                 base: 'var(--color-node-base-available)' },
    attended: { icon: CalendarCheck, label: 'presença confirmada',    base: 'var(--color-node-base-completed)' },
    missed:   { icon: CalendarX,     label: 'presença não confirmada', base: 'var(--color-node-base-locked)'   },
};

const formatDay = (timestamp: string) => new Date(timestamp).toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit',
});

const labelOf = (branch: TrailBranch) =>
    `Encontro presencial ${branch.title}, ${formatDay(branch.startsAt)}, ${statusInfo[branch.status].label}`;

export default function TrailBranches({ parentTitle, branches, side, readOnly, onSelect }: TrailBranchesProps) {
    if (!branches.length) return null;

    const visible = branches.length > MAX_VISIBLE ? branches.slice(0, MAX_VISIBLE - 1) : branches;
    const hidden = branches.slice(visible.length);

    // slot index -> distance from the node's center (css reads --slot and --side)
    const slotStyle = (slot: number) => ({ '--slot': slot } as CSSProperties);

    return (
        <ul
            className={styles.branches}
            style={{ '--side': side } as CSSProperties}
            aria-label={`Encontros presenciais ligados a ${parentTitle}`}
        >
            {visible.map((branch, slot) => {
                const { icon: Icon, base } = statusInfo[branch.status];

                return (
                    <li key={branch.id} className={styles.slot} style={slotStyle(slot)}>
                        <PressableBase color={base} depth={5} radius='50%'>
                            {readOnly ? (
                                <div role='img' aria-label={labelOf(branch)} className={`${styles.branch} ${styles[branch.status]}`}>
                                    <Icon aria-hidden='true'/>
                                </div>
                            ) : (
                                <button
                                    type='button'
                                    aria-label={labelOf(branch)}
                                    className={`${styles.branch} ${styles[branch.status]}`}
                                    onClick={() => onSelect(branch.id)}
                                >
                                    <Icon aria-hidden='true'/>
                                </button>
                            )}
                        </PressableBase>
                        <span className={styles.date} aria-hidden='true'>{formatDay(branch.startsAt)}</span>
                    </li>
                );
            })}

            {hidden.length > 0 && (
                <li className={styles.slot} style={slotStyle(visible.length)}>
                    <details className={styles.more}>
                        <summary aria-label={`Mais ${hidden.length} encontros presenciais`}>
                            +{hidden.length}
                        </summary>
                        <ul className={`${styles.list} ${side === 1 ? styles.alignEnd : ''}`}>
                            {hidden.map((branch) => (
                                <li key={branch.id}>
                                    {readOnly ? (
                                        <span aria-label={labelOf(branch)}>
                                            {formatDay(branch.startsAt)} · {branch.title}
                                        </span>
                                    ) : (
                                        <button type='button' aria-label={labelOf(branch)} onClick={() => onSelect(branch.id)}>
                                            {formatDay(branch.startsAt)} · {branch.title}
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </details>
                </li>
            )}
        </ul>
    );
}
