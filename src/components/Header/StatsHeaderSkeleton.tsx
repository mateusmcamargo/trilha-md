import Skeleton from '#/components/Skeleton/Skeleton';

import styles from './StatsHeader.module.scss';

// same layout as StatsHeader: trail badge on the left, xp, streak and lives on the right
export default function StatsHeaderSkeleton() {
    return (
        <header className={styles.header} aria-hidden='true'>
            <div className={styles.trailInfo}>
                <Skeleton width='9.6rem' height='3.4rem'/>
            </div>

            <div className={styles.progressInfo}>
                <Skeleton width='4rem' height='2.6rem'/>
                <Skeleton width='4rem' height='2.6rem'/>
                <Skeleton width='4rem' height='2.6rem'/>
            </div>
        </header>
    );
}
