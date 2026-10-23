import Skeleton from '#/components/Skeleton/Skeleton';

import { trailLayout } from './trailLayout';

import styles from './Trail.module.scss';

interface TrailSkeletonProps {
    count?: number;
}

// same wave as Trail, with placeholder nodes
export default function TrailSkeleton({ count = 5 }: TrailSkeletonProps) {
    const { positions, width, height } = trailLayout(count);

    return (
        <div className={styles.trail} aria-hidden='true' style={{ width, height }}>
            {positions.map((position, index) => (
                <div
                    key={index}
                    className={styles.nodePosition}
                    style={{
                        left: `calc(50% + ${position.x}px)`,
                        top: position.y,
                    }}
                >
                    <Skeleton width='70px' height='57px' radius='50%'/>
                </div>
            ))}
        </div>
    );
}
