'use client';

import { useRouter } from 'next/navigation';

import type { TrailBranch } from '#/utils/menteeData';

import TrailBranches from './TrailBranches';
import TrailNode, { TrailNodeStatus } from './TrailNode';
import { trailLayout } from './trailLayout';

import styles from './Trail.module.scss';

interface TrailItem {
    id: string;
    title: string;
    status: TrailNodeStatus;
    progress: number;
    // in-person events drawn beside the node
    branches?: TrailBranch[];
}

interface TrailProps {
    items: TrailItem[];
    // only shows the state (mentor's view): the nodes aren't buttons
    readOnly?: boolean;
    onSelect?: (id: string) => void;
}

export default function Trail({ items, readOnly, onSelect }: TrailProps) {
    const router = useRouter();
    // default: opens the activity
    const select = onSelect ?? ((id: string) => router.push(`/trail/${id}`));

    const { positions, width, height } = trailLayout(items.length);

    return (
        <div
            className={styles.trail}
            role='list'
            aria-label='Atividades da trilha'
            style={{
                width,
                height,
            }}
        >

            {items.map((item, index) => {
                const position = positions[index];

                return (
                    <div
                        key={item.id}
                        role='listitem'
                        className={styles.nodePosition}
                        style={{
                            left: `calc(50% + ${position.x}px)`,
                            top: position.y,
                        }}
                    >
                        <TrailNode
                            id={item.id}
                            title={item.title}
                            status={item.status}
                            progress={item.progress}
                            readOnly={readOnly}
                            onClick={readOnly ? undefined : () => select(item.id)}
                        />
                        <TrailBranches
                            parentTitle={item.title}
                            branches={item.branches ?? []}
                            side={position.x > 0 ? -1 : 1}
                            readOnly={readOnly}
                            onSelect={select}
                        />
                    </div>
                );
            })}
        </div>
    );
}