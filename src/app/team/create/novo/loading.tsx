import EventFormSkeleton from '#/components/Creator/EventFormSkeleton';
import PageHeaderSkeleton from '#/components/Header/PageHeaderSkeleton';

// shown at once on navigation, while the edition and its activities load
export default function NewEventLoading() {
    return (
        <>
            <PageHeaderSkeleton title='Nova presencial'/>

            <main className='main-subpage' aria-label='Nova atividade presencial' aria-busy='true'>
                <p role='status' className='sr-only'>Carregando o formulário...</p>

                <EventFormSkeleton/>
            </main>
        </>
    );
}
