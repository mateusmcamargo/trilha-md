import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ArrowLeft } from 'lucide-react';

import EventForm from '#/components/Creator/EventForm';
import PageHeader from '#/components/Header/PageHeader';
import { getCreatorEditions, getParentOptions } from '#/utils/creatorData';
import { isSkeletonPreview } from '#/utils/skeletonPreview';

import NewEventLoading from './loading';

export const metadata: Metadata = {
    title: 'Nova atividade presencial',
};

export default async function NewEventPage({ searchParams }: { searchParams: Promise<{ edicao?: string }> }) {
    // demo mode with the data turned off
    if (await isSkeletonPreview()) return <NewEventLoading/>;

    const { edicao } = await searchParams;
    const edition = (await getCreatorEditions()).find((item) => item.id === edicao);
    if (!edition) notFound();

    const parents = await getParentOptions(edition.id);
    const backHref = `/team/create?edicao=${edition.id}`;

    return (
        <>
            <PageHeader
                title='Nova presencial'
                action={{ href: backHref, label: 'Voltar à lista de atividades', icon: ArrowLeft }}
            />

            <main className='main-subpage' aria-label={`Nova atividade presencial na edição ${edition.name}`}>
                <EventForm editionId={edition.id} event={null} parents={parents}/>
            </main>
        </>
    );
}
