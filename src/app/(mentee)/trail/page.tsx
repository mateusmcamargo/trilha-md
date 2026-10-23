import type { Metadata } from 'next';

import StatsHeader from '#/components/Header/StatsHeader';
import Trail from '#/components/Trail/Trail';
import TrailCard from '#/components/Trail/TrailCard';

import styles from './page.module.scss';
import { getMenteeData } from '#/utils/menteeData';
import { JoinEditionForm } from '#/components/JoinEditionForm/JoinEditionForm';
import { isSkeletonPreview } from '#/utils/skeletonPreview';

import TrailLoading from './loading';

export const metadata: Metadata = {
    title: 'Trilha',
};

export default async function TrailPage() {
    // demo mode with the data turned off
    if (await isSkeletonPreview()) return <TrailLoading/>;

    const { stats, trail, trailItems, trailProgress } = await getMenteeData();

        if (!trail) {
            return (
                <>
                    <StatsHeader/>

                    <main
                        className={`main-tabs ${styles.trail}`}
                        aria-label='Atividades da minha trilha'
                    >
                        <JoinEditionForm/>
                    </main>
                </>
            );
        }

    return (
        <>
            <StatsHeader/>

            <main
                className={`main-tabs ${styles.trail}`}
                aria-label='Atividades da minha trilha'
            >

                <TrailCard name={trail.name} subtitle={trail.subtitle} progress={trailProgress}/>

                <section className={styles.trailPath}>
                    <Trail items={trailItems}/>
                </section>
            </main>
        </>
    );
}