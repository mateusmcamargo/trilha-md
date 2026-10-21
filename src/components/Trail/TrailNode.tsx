'use client';

import { Check, Star, Lock } from 'lucide-react';
import styles from './TrailNode.module.scss';
import { CircularProgressBar } from './CircularProgressBar';
import TrailNodeShine from './TrailNodeShine';
import PressableBase from '#/components/PressableBase/PressableBase';

export type TrailNodeStatus = 'locked' | 'available' | 'completed' | 'gold';

interface TrailNodeProps {
    id: string;
    title: string;
    status: TrailNodeStatus;
    progress: number;
    // not a button: just shows the state (mentor's view)
    readOnly?: boolean;
    onClick?: () => void;
}

const pressableBaseColors: Record<TrailNodeStatus, string> = {
    available: 'var(--color-node-base-available)',
    completed: 'var(--color-node-base-completed)',
    gold:      'var(--color-gold-base)',
    locked:    'var(--color-node-base-locked)',
};

const statusLabels: Record<TrailNodeStatus, string> = {
    locked:    'bloqueada',
    available: 'disponível',
    completed: 'concluída',
    gold:      'dominada',
};

export default function TrailNode({
    id,
    title,
    status,
    progress,
    readOnly,
    onClick,
}: TrailNodeProps) {
    const isLocked = status === 'locked';
    const isDone   = status === 'completed' || status === 'gold';

    const label = status === 'available'
        ? `${title}, ${statusLabels[status]}, ${progress}% concluída`
        : `${title}, ${statusLabels[status]}`;

    const content = (
        <>
            {isDone && <TrailNodeShine className={styles.shine}/>}
            <span className={styles.icon} aria-hidden='true'>
                {isDone
                    ? <Check/>
                    : isLocked
                    ? <Lock/>
                    : <Star />
                }
            </span>
        </>
    );

    return (
        <div className={styles.node}>

            {status === 'available' && (
                <CircularProgressBar
                    width={90}
                    height={98}
                    progress={progress}
                    showLabel={false}
                    decorative
                />
            )}

            <PressableBase color={pressableBaseColors[status]} radius='50%'>
                {readOnly ? (
                    <div
                        id={id}
                        role='img'
                        aria-label={label}
                        className={`${styles.trailNode} ${styles[status]} ${styles.readOnly}`}
                    >
                        {content}
                    </div>
                ) : (
                    <button
                        id={id}
                        type='button'
                        onClick={isLocked ? undefined : onClick}
                        aria-disabled={isLocked}
                        aria-label={label}
                        className={`${styles.trailNode} ${styles[status]}`}
                    >
                        {content}
                    </button>
                )}
            </PressableBase>
        </div>
    );
}