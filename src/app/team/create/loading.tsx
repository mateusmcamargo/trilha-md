import { Settings } from 'lucide-react';

import ActivityOutlineSkeleton from '#/components/Creator/ActivityOutlineSkeleton';
import PageHeader from '#/components/Header/PageHeader';

// shown at once on navigation, while the editions and activities load
export default function CreateLoading() {
    return (
        <>
            <PageHeader
                title='Criar'
                action={{ href: '/team/settings', label: 'Configurações', icon: Settings }}
            />

            <main className='main-tabs' aria-label='Criar atividades' aria-busy='true'>
                <p role='status' className='sr-only'>Carregando as atividades...</p>

                <ActivityOutlineSkeleton/>
            </main>
        </>
    );
}
