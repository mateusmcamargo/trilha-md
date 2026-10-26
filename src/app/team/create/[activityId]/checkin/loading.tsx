import CheckinScreenSkeleton from '#/components/Creator/CheckinScreenSkeleton';
import PageHeaderSkeleton from '#/components/Header/PageHeaderSkeleton';

// shown at once on navigation, while the event loads
export default function CheckinLoading() {
    return (
        <>
            <PageHeaderSkeleton title='Presença'/>

            <main className='main-subpage' aria-label='QR Code de presença' aria-busy='true'>
                <p role='status' className='sr-only'>Carregando o QR Code...</p>

                <CheckinScreenSkeleton/>
            </main>
        </>
    );
}
