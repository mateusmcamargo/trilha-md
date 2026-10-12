
'use client';

import { Check, Star, Lock } from 'lucide-react';
import styles from './TrailNode.module.scss';
import { CircularProgressBar } from './CircularProgressBar';

export type TrailNodeStatus = 'locked' | 'available' | 'completed' | 'mastered';

interface TrailNodeProps {
    id: string;
    status: TrailNodeStatus;
    progress: number;
    onClick?: () => void;
}

export default function TrailNode({
    id,
    status,
    progress,
    onClick,
}: TrailNodeProps) {
    const isLocked    = status === 'locked';
    const isCompleted = status === 'completed';
    const isMastered  = status === 'mastered';

    const statusClass =
        status === 'completed'
            ? styles.completed
            : status === 'available'
            ? styles.available
            : status === 'mastered'
            ? styles.mastered
            : styles.locked;

    return (
        <div className={`${styles.node} ${statusClass}`}>

            {status === 'available' && (
                <CircularProgressBar
                    width={90}
                    height={98}
                    progress={progress}
                    className='available'
                    showLabel={false}
                />
            )}

            <button
                id={id}
                onClick={onClick}
                disabled={isLocked}
                className={`${styles.trailNode} ${statusClass}`}
            >
                <span className={styles.icon}>
                    {isCompleted || isMastered
                        ? <Check/>
                        : isLocked
                        ? <Lock/>
                        : <Star />
                    }
                </span>
            </button>
        </div>
    );
}