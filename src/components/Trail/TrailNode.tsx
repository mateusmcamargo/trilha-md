'use client';

import { Check, Star, Lock } from 'lucide-react';
import styles from './TrailNode.module.scss';
import { CircularProgressBar } from './CircularProgressBar';
import TrailNodeShine from './TrailNodeShine';
import PressableBase from '#/components/PressableBase/PressableBase';

export type TrailNodeStatus = 'locked' | 'available' | 'completed' | 'mastered';

interface TrailNodeProps {
    id: string;
    title: string;
    status: TrailNodeStatus;
    progress: number;
    onClick?: () => void;
}

const pressableBaseColors: Record<TrailNodeStatus, string> = {
    available: 'var(--color-node-base-available)',
    completed: 'var(--color-node-base-completed)',
    mastered:  'var(--color-node-base-mastered)',
    locked:    'var(--color-node-base-locked)',
};

const statusLabels: Record<TrailNodeStatus, string> = {
    locked:    'bloqueada',
    available: 'disponível',
    completed: 'concluída',
    mastered:  'dominada',
};

export default function TrailNode({
    id,
    title,
    status,
    progress,
    onClick,
}: TrailNodeProps) {
    const isLocked = status === 'locked';
    const isDone   = status === 'completed' || status === 'mastered';

    const label = status === 'available'
        ? `${title}, ${statusLabels[status]}, ${progress}% concluída`
        : `${title}, ${statusLabels[status]}`;

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
                <button
                    id={id}
                    type='button'
                    onClick={isLocked ? undefined : onClick}
                    aria-disabled={isLocked}
                    aria-label={label}
                    className={`${styles.trailNode} ${styles[status]}`}
                >
                    {isDone && <TrailNodeShine className={styles.shine}/>}
                    <span className={styles.icon} aria-hidden='true'>
                        {isDone
                            ? <Check/>
                            : isLocked
                            ? <Lock/>
                            : <Star />
                        }
                    </span>
                </button>
            </PressableBase>
        </div>
    );
}