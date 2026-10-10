'use client';

import { Check, Star, Lock } from 'lucide-react';
import styles from './TrailNode.module.scss';

export type TrailNodeStatus = 'locked' | 'available' | 'completed';

interface TrailNodeProps {
    id: string;
    status: TrailNodeStatus;
    onClick?: () => void;
}

export default function TrailNode({
    id,
    status,
    onClick,
}: TrailNodeProps) {
    const isLocked    = status === 'locked';
    const isCompleted = status === 'completed';

    return (
        <div className={styles.node}>
            <button
                id={id}
                onClick={onClick}
                disabled={isLocked}
                className={`
                    ${styles.trailNode}
                    ${isCompleted
                        ? styles.completed
                        : status === 'available'
                        ? styles.available
                        : styles.locked
                    }
                `}
            >
                <span className={styles.icon}>
                    {isCompleted ? <Check/> : isLocked ? <Lock/> : <Star/>}
                </span>
            </button>
        </div>
    );
}