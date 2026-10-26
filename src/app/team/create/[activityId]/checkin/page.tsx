import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ArrowLeft } from 'lucide-react';

import CheckinScreen from '#/components/Creator/CheckinScreen';
import PageHeader from '#/components/Header/PageHeader';
import { getActivityKind, getEditableEvent } from '#/utils/creatorData';
import { isSkeletonPreview } from '#/utils/skeletonPreview';

import CheckinLoading from './loading';

export const metadata: Metadata = {
    title: 'QR Code de presença',
};

export default async function CheckinPage({ params }: { params: Promise<{ activityId: string }> }) {
    // demo mode with the data turned off
    if (await isSkeletonPreview()) return <CheckinLoading/>;

    const { activityId } = await params;
    const data = (await getActivityKind(activityId)) === 'presencial' ? await getEditableEvent(activityId) : null;
    if (!data) notFound();

    return (
        <>
            <PageHeader
                title='Presença'
                action={{ href: `/team/create/${activityId}`, label: 'Voltar à atividade', icon: ArrowLeft }}
            />

            <main className='main-subpage' aria-label={`QR Code de presença de ${data.event.title}`}>
                <CheckinScreen activityId={activityId} title={data.event.title}/>
            </main>
        </>
    );
}
