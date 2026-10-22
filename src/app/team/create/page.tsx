import type { Metadata } from 'next';

import { Settings } from 'lucide-react';

import ActivityOutline from '#/components/Creator/ActivityOutline';
import PageHeader from '#/components/Header/PageHeader';
import { getCreatorEditions, getEditionOutline } from '#/utils/creatorData';

import styles from './page.module.scss';

export const metadata: Metadata = {
    title: 'Criar',
};

export default async function CreatePage({ searchParams }: { searchParams: Promise<{ edicao?: string }> }) {
    const { edicao } = await searchParams;
    const editions = await getCreatorEditions();
    const edition = editions.find((item) => item.id === edicao) ?? editions[0];
    const activities = edition ? await getEditionOutline(edition.id) : [];

    return (
        <>
            <PageHeader
                title='Criar'
                action={{ href: '/team/settings', label: 'Configurações', icon: Settings }}
            />

            <main className='main-tabs' aria-label='Criar atividades'>
                {edition ? (
                    <ActivityOutline editions={editions} editionId={edition.id} activities={activities}/>
                ) : (
                    <p className={styles.empty}>Nenhuma edição ativa ou em planejamento.</p>
                )}
            </main>
        </>
    );
}
