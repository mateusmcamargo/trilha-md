import PageHeaderSkeleton from '#/components/Header/PageHeaderSkeleton';
import TrailCardSkeleton from '#/components/Trail/TrailCardSkeleton';
import TrailSkeleton from '#/components/Trail/TrailSkeleton';

import styles from './page.module.scss';

// shown at once on navigation, while getMenteeTrail loads: same card and wave as the mentee's trail
export default function MenteeTrailLoading() {
    return (
        <>
            <PageHeaderSkeleton/>

            <main className={`main-tabs ${styles.trail}`} aria-label='Trilha da mentorada' aria-busy='true'>
                <p role='status' className='sr-only'>Carregando a trilha...</p>

                <TrailCardSkeleton/>
                <TrailSkeleton/>
            </main>
        </>
    );
}
