import type { Metadata } from 'next';

import { ArrowLeft } from 'lucide-react';

import PageHeader from '#/components/Header/PageHeader';
import Trail from '#/components/Trail/Trail';
import TrailCard from '#/components/Trail/TrailCard';
import { getMenteeTrail } from '#/utils/dashboardData';
import { isSkeletonPreview } from '#/utils/skeletonPreview';

import MenteeTrailLoading from './loading';

import styles from './page.module.scss';

export const metadata: Metadata = {
    title: 'Trilha da mentorada',
};

export default async function MenteeTrailPage({ params }: { params: Promise<{ menteeId: string }> }) {
    // demo mode with the data turned off
    if (await isSkeletonPreview()) return <MenteeTrailLoading/>;

    const { menteeId } = await params;
    const { mentee, trail, trailItems, trailProgress } = await getMenteeTrail(menteeId);

    const firstName = mentee.name.trim().split(/\s+/)[0];

    return (
        <>
            <PageHeader
                title={`Trilha da ${firstName}`}
                action={{ href: `/team/dashboard/${menteeId}`, label: `Voltar ao painel da ${mentee.name}`, icon: ArrowLeft }}
            />

            <main className={`main-tabs ${styles.trail}`} aria-label={`Trilha da ${mentee.name}`}>
                <TrailCard name={trail.name} subtitle={trail.subtitle} progress={trailProgress}/>

                <Trail items={trailItems} readOnly/>
            </main>
        </>
    );
}
