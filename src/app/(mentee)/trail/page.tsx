import type { Metadata } from 'next';

import StatsHeader from '#/components/Header/StatsHeader';
import { JoinEditionForm } from '#/components/JoinEditionForm/JoinEditionForm';
import Trail from '#/components/Trail/Trail';
import TrailCard from '#/components/Trail/TrailCard';
import { getMenteeData } from '#/utils/menteeData';
import { isSkeletonPreview } from '#/utils/skeletonPreview';

import TrailLoading from './loading';

import styles from './page.module.scss';

export const metadata: Metadata = {
    title: 'Trilha',
};

export default async function TrailPage() {
    // demo mode with the data turned off
    if (await isSkeletonPreview()) return <TrailLoading/>;

    const { trail, trailItems, trailProgress } = await getMenteeData();

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