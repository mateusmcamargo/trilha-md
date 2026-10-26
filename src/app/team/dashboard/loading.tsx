import { Settings } from 'lucide-react';

import DataListSkeleton from '#/components/DataList/DataListSkeleton';
import PageHeader from '#/components/Header/PageHeader';
import StatCardSkeleton from '#/components/StatCard/StatCardSkeleton';

import styles from './page.module.scss';

// shown at once on navigation, while getDashboardOverview loads
export default function DashboardLoading() {
    return (
        <>
            <PageHeader
                title='Painel'
                action={{ href: '/team/settings', label: 'Configurações', icon: Settings }}
            />

            <main className='main-tabs' aria-label='Painel da mentora' aria-busy='true'>
                <p role='status' className='sr-only'>Carregando o painel...</p>

                <section className={styles.section} aria-hidden='true'>
                    <h2>Resumo</h2>

                    <div className={styles.cards}>
                        {[0, 1, 2, 3].map((index) => <StatCardSkeleton key={index}/>)}
                    </div>
                </section>

                <section className={styles.section} aria-hidden='true'>
                    <h2>Suas mentoradas</h2>
                    <DataListSkeleton columns={['Nome', 'Presença', 'Ações']}/>
                </section>
            </main>
        </>
    );
}
