import type { Metadata } from 'next';

import { JoinEditionForm } from '#/components/JoinEditionForm/JoinEditionForm';
import { SettingsPage } from '#/components/Settings/SettingsPage';
import { TrailsList } from '#/components/Settings/TrailsList';

import { getMenteeData } from '#/utils/menteeData';
import { isSkeletonPreview } from '#/utils/skeletonPreview';

import TrailsLoading from './loading';

import styles from '#/components/Settings/Settings.module.scss';

export const metadata: Metadata = {
    title: 'Trilhas',
};

export default async function TrailsPage() {
    // demo mode with the data turned off
    if (await isSkeletonPreview()) return <TrailsLoading/>;

    const { enrollments } = await getMenteeData();
    const hasActive = enrollments.some((enrollment) => enrollment.status === 'active');

    return (
        <SettingsPage title='Trilhas' backHref='/settings'>
            {!hasActive && <JoinEditionForm/>}

            <section className={styles.section}>
                <h2>Suas trilhas</h2>
                <TrailsList enrollments={enrollments}/>
            </section>
        </SettingsPage>
    );
}
