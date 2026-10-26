import type { Metadata } from 'next';

import { Settings } from 'lucide-react';

import PageHeader from '#/components/Header/PageHeader';
import MenteeList from '#/components/MenteeList/MenteeList';
import { isSkeletonPreview } from '#/utils/skeletonPreview';
import { getMenteesData } from '#/utils/teamData';

import MenteesLoading from './loading';

export const metadata: Metadata = {
    title: 'Mentoradas',
};

export default async function MenteesPage() {
    // demo mode with the data turned off
    if (await isSkeletonPreview()) return <MenteesLoading/>;

    const { mine, all } = await getMenteesData();

    return (
        <>
            <PageHeader
                title='Mentoradas'
                action={{ href: '/team/settings', label: 'Configurações', icon: Settings }}
            />

            <main className='main-tabs' aria-label='Mentoradas'>
                <MenteeList mine={mine} all={all}/>
            </main>
        </>
    );
}
