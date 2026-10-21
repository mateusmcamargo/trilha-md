import type { Metadata } from 'next';

import StatsHeader from '#/components/Header/StatsHeader';
import Trail from '#/components/Trail/Trail';
import TrailCard from '#/components/Trail/TrailCard';

import styles from './page.module.scss';
import { getMenteeData } from '#/utils/menteeData';
import { JoinEditionForm } from '#/components/JoinEditionForm/JoinEditionForm';

export const metadata: Metadata = {
    title: 'Trilha',
};

export default async function TrailPage() {

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