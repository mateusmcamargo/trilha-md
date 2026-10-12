'use client';

import { Check, Star, Lock } from 'lucide-react';
import styles from './TrailNode.module.scss';
import { CircularProgressBar } from './CircularProgressBar';
import TrailNodeShine from './TrailNodeShine';
import PressableBase from '#/components/PressableBase/PressableBase';

export type TrailNodeStatus = 'locked' | 'available' | 'completed' | 'mastered';

interface TrailNodeProps {
    id: string;
    status: TrailNodeStatus;
    progress: number;
    onClick?: () => void;
}

const pressableBaseColors: Record<TrailNodeStatus, string> = {
    available: '#400d88',
    completed: '#347c01',
    mastered:  '#e6a000',
    locked:    'var(--color-node-border-locked)',
};

export default function TrailNode({
    id,
    status,
    progress,
    onClick,
}: TrailNodeProps) {
    const isLocked = status === 'locked';
    const isDone   = status === 'completed' || status === 'mastered';

    return (
        <div className={styles.node}>

            {status === 'available' && (
                <CircularProgressBar
                    width={90}
                    height={98}
                    progress={progress}
                    showLabel={false}
                />
            )}

            <PressableBase color={pressableBaseColors[status]} radius='50%'>
                <button
                    id={id}
                    onClick={onClick}
                    disabled={isLocked}
                    className={`${styles.trailNode} ${styles[status]}`}
                >
                    {isDone && <TrailNodeShine className={styles.shine}/>}
                    <span className={styles.icon}>
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