import Skeleton from '#/components/Skeleton/Skeleton';

import styles from './StatCard.module.scss';

interface StatCardSkeletonProps {
    square?: boolean;
}

// same layout as StatCard: icon, value and label
export default function StatCardSkeleton({ square }: StatCardSkeletonProps) {
    const icon = square ? '3.6rem' : '2.8rem';

    return (
        <div className={[styles.card, square && styles.square].filter(Boolean).join(' ')} aria-hidden='true'>
            <Skeleton width={icon} height={icon} radius='50%'/>

            <dl>
                <dt><Skeleton width='8rem' height='1.3rem'/></dt>
                <dd><Skeleton width='5rem' height='2.4rem'/></dd>
            </dl>
        </div>
    );
}
