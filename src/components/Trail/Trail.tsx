'use client';

import { useRouter } from 'next/navigation';

import type { TrailBranch } from '#/utils/menteeData';

import TrailBranches from './TrailBranches';
import TrailNode, { TrailNodeStatus } from './TrailNode';

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

interface Position {
    x: number;
    y: number;
}

const NODE_SIZE = 80;
const VERTICAL_DISTANCE = 90;
const AMPLITUDE = 64;      // max displacement per wave
const NODES_PER_WAVE = 6;  // how many nodes form a wave

export default function Trail({ items, readOnly, onSelect }: TrailProps) {
    const router = useRouter();
    // default: opens the activity
    const select = onSelect ?? ((id: string) => router.push(`/trail/${id}`));

    const positions: Position[] = items.map((_, index) => {
        const angle = (index / NODES_PER_WAVE) * Math.PI * 2;

        return {
            x: Math.round(Math.sin(angle) * AMPLITUDE),
            y: index * VERTICAL_DISTANCE,
        };
    });

    const minX = positions.length
        ? Math.min(...positions.map((p) => p.x))
        : 0;

    const maxX = positions.length
        ? Math.max(...positions.map((p) => p.x))
        : 0;

    const width = maxX - minX + NODE_SIZE + 200;

    const height = positions.length
        ? positions[positions.length - 1].y + NODE_SIZE
        : 0;

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