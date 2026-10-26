import { X } from 'lucide-react';

import PageHeaderSkeleton from '#/components/Header/PageHeaderSkeleton';
import ActivityPlayerSkeleton from '#/components/minigames/ActivityPlayer/ActivityPlayerSkeleton';

// shown at once on navigation, while the activity loads; most nodes are minigames, so it draws the player
export default function ActivityLoading() {
    return (
        <>
            <PageHeaderSkeleton action={{ href: '/trail', label: 'Sair da atividade', icon: X }}/>

            <main className='main-subpage' aria-label='Atividade' aria-busy='true'>
                <p role='status' className='sr-only'>Carregando a atividade...</p>

                <ActivityPlayerSkeleton/>
            </main>
        </>
    );
}
