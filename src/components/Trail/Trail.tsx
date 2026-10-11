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
    const VERTICAL_DISTANCE = 80;
    const HORIZONTAL_DISTANCE = 50;

    const positions: Position[] = items.map((_, index) => {
        const pattern = index % 4;

        let x = 0;

        switch (pattern) {
            case 0:
                x = 0;
            break;

            case 1:
                x = HORIZONTAL_DISTANCE;
            break;

            case 2:
                x = (HORIZONTAL_DISTANCE * 2);
            break;

            case 3:
                x = HORIZONTAL_DISTANCE;
            break;

            case 4:
                x = 0;
            break;

            case 5:
                x = -HORIZONTAL_DISTANCE;
            break;

            case 6:
                x = (-HORIZONTAL_DISTANCE * 2);
            break;

            case 7:
                x = -HORIZONTAL_DISTANCE;
            break;
        }

        return {
            x,
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

    const centerX = width / 2;

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