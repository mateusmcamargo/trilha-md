import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ArrowLeft, QrCode } from 'lucide-react';

import { Button } from '#/components/Button/Button';
import ActivityEditor from '#/components/Creator/ActivityEditor';
import DeleteEventButton from '#/components/Creator/DeleteEventButton';
import EventForm from '#/components/Creator/EventForm';
import MaterialsEditor from '#/components/Creator/MaterialsEditor';
import PageHeader from '#/components/Header/PageHeader';
import { getActivityKind, getEditableActivity, getEditableEvent } from '#/utils/creatorData';
import { isSkeletonPreview } from '#/utils/skeletonPreview';

import EditActivityLoading from './loading';

import styles from './page.module.scss';

export const metadata: Metadata = {
    title: 'Editar atividade',
};

async function EventEditorPage({ activityId }: { activityId: string }) {
    const data = await getEditableEvent(activityId);
    if (!data) notFound();

    const { event, materials, parents } = data;
    const backHref = `/team/create?edicao=${event.edition_id}`;

    return (
        <>
            <PageHeader
                title='Atividade presencial'
                action={{ href: backHref, label: 'Voltar à lista de atividades', icon: ArrowLeft }}
            />

            <main className='main-subpage' aria-label={`Editar ${event.title}`}>
                <section className={styles.section} aria-labelledby='event-title'>
                    <h2 id='event-title'>Dados do encontro</h2>
                    <EventForm editionId={event.edition_id} event={event} parents={parents}/>
                </section>

                <section className={styles.section} aria-labelledby='checkin-title'>
                    <h2 id='checkin-title'>Presença</h2>
                    <p className={styles.help}>
                        No dia, mostre o QR Code na tela. Cada mentorada aponta a câmera do celular e confirma a presença.
                    </p>
                    <Button href={`/team/create/${event.id}/checkin`} variant='brand' icon={QrCode} fullWidth>
                        Abrir QR Code de presença
                    </Button>
                </section>

                <section className={styles.section} aria-labelledby='materials-title'>
                    <h2 id='materials-title'>Materiais</h2>
                    <MaterialsEditor activityId={event.id} materials={materials}/>
                </section>

                <section className={styles.section} aria-labelledby='delete-title'>
                    <h2 id='delete-title'>Excluir</h2>
                    <DeleteEventButton
                        activityId={event.id}
                        title={event.title}
                        backHref={backHref}
                        storagePaths={materials.flatMap((material) => material.storage_path ?? [])}
                    />
                </section>
            </main>
        </>
    );
}

export default async function EditActivityPage({ params }: { params: Promise<{ activityId: string }> }) {
    // demo mode with the data turned off
    if (await isSkeletonPreview()) return <EditActivityLoading/>;

    const { activityId } = await params;
    const kind = await getActivityKind(activityId);

    if (kind === 'presencial') return <EventEditorPage activityId={activityId}/>;

    const data = kind === 'remota' ? await getEditableActivity(activityId) : null;
    if (!data) notFound();

    const backHref = `/team/create?edicao=${data.activity.edition_id}`;

    return (
        <>
            <PageHeader
                title='Editar atividade'
                action={{ href: backHref, label: 'Voltar à lista de atividades', icon: ArrowLeft }}
            />

            <main className='main-subpage' aria-label={`Editar ${data.activity.title}`}>
                <ActivityEditor data={data} backHref={backHref}/>
            </main>
        </>
    );
}
