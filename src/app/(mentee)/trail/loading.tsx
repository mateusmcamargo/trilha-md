import StatsHeaderSkeleton from '#/components/Header/StatsHeaderSkeleton';
import TrailCardSkeleton from '#/components/Trail/TrailCardSkeleton';
import TrailSkeleton from '#/components/Trail/TrailSkeleton';

import styles from './page.module.scss';

// shown at once on navigation, while getMenteeData loads
export default function TrailLoading() {
    return (
        <>
            <StatsHeaderSkeleton/>

            <main
                className={`main-tabs ${styles.trail}`}
                aria-label='Atividades da minha trilha'
                aria-busy='true'
            >
                <p role='status' className='sr-only'>Carregando a trilha...</p>

                <TrailCardSkeleton/>

                <section className={styles.trailPath}>
                    <TrailSkeleton/>
                </section>
            </main>
        </>
    );
}
