'use client';

import TrailNode, { TrailNodeStatus } from './TrailNode';

import styles from './Trail.module.scss';

interface TrailItem {
    id: string;
    title: string;
    status: TrailNodeStatus;
    progress: number;
}

interface TrailProps {
    items: TrailItem[];
}

interface Position {
    x: number;
    y: number;
}

export default function Trail({ items }: TrailProps) {

    const NODE_SIZE = 80;
    const VERTICAL_DISTANCE = 90;
    const AMPLITUDE = 64;      // max displacement per wave
    const NODES_PER_WAVE = 6;  // how many nodes form a wave

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
        ? positions[positions.length - 1].y + NODE_SIZE + 150
        : 0;

    return (
        <div
            className={styles.trail}
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
                        className={styles.nodePosition}
                        style={{
                            left: `calc(50% + ${position.x}px)`,
                            top: position.y,
                        }}
                    >
                        <TrailNode
                            id={item.id}
                            status={item.status}
                            progress={item.progress}
                            onClick={() => {
                                console.log(
                                    `Atividade selecionada: ${item.id}`
                                );
                            }}
                        />
                    </div>
                );
            })}
        </div>
    );
}