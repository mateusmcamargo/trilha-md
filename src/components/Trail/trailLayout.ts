// wave positions of the trail nodes, shared by Trail and TrailSkeleton

export interface Position {
    x: number;
    y: number;
}

const NODE_SIZE = 80;
const VERTICAL_DISTANCE = 90;
const AMPLITUDE = 64;      // max displacement per wave
const NODES_PER_WAVE = 6;  // how many nodes form a wave

export function trailLayout(count: number) {
    const positions: Position[] = Array.from({ length: count }, (_, index) => {
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

    return { positions, width, height };
}
