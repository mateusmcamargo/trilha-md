import { Settings } from 'lucide-react';

import DataListSkeleton from '#/components/DataList/DataListSkeleton';
import PageHeader from '#/components/Header/PageHeader';

import styles from '#/components/MenteeList/MenteeList.module.scss';

// shown at once on navigation, while getMenteesData loads: same two tables as MenteeList
export default function MenteesLoading() {
    return (
        <>
            <PageHeader
                title='Mentoradas'
                action={{ href: '/team/settings', label: 'Configurações', icon: Settings }}
            />

            <main className='main-tabs' aria-label='Mentoradas' aria-busy='true'>
                <p role='status' className='sr-only'>Carregando as mentoradas...</p>

                <section className={styles.section} aria-hidden='true'>
                    <h2>Suas mentoradas</h2>
                    <DataListSkeleton columns={['Nome', 'Ações']} rows={3}/>
                </section>

                <section className={styles.section} aria-hidden='true'>
                    <h2>Todas as mentoradas</h2>
                    <DataListSkeleton columns={['Nome', 'Mentora', 'Ações']}/>
                </section>
            </main>
        </>
    );
}
