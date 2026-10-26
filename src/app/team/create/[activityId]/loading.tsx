import ActivityEditorSkeleton from '#/components/Creator/ActivityEditorSkeleton';
import PageHeaderSkeleton from '#/components/Header/PageHeaderSkeleton';

// shown at once on navigation, while the activity loads; draws the minigame editor, the most common one
export default function EditActivityLoading() {
    return (
        <>
            <PageHeaderSkeleton/>

            <main className='main-subpage' aria-label='Editar atividade' aria-busy='true'>
                <p role='status' className='sr-only'>Carregando a atividade...</p>

                <ActivityEditorSkeleton/>
            </main>
        </>
    );
}
