import { ArrowLeft, CalendarDays, CheckLine, Route, ScrollText, Sparkles } from 'lucide-react';

import PageHeaderSkeleton from '#/components/Header/PageHeaderSkeleton';
import Skeleton from '#/components/Skeleton/Skeleton';
import StatCardSkeleton from '#/components/StatCard/StatCardSkeleton';

import styles from './page.module.scss';

// shown at once on navigation, while getMenteeDashboard loads
export default function MenteeDashboardLoading() {
    return (
        <>
            <PageHeaderSkeleton action={{ href: '/team/dashboard', label: 'Voltar ao painel', icon: ArrowLeft }}/>

            <main className='main-tabs' aria-label='Painel da mentorada' aria-busy='true'>
                <p role='status' className='sr-only'>Carregando o painel da mentorada...</p>

                <section className={styles.identity} aria-hidden='true'>
                    <Skeleton width='8rem' height='8rem' radius='50%'/>

                    <div className={styles.name}>
                        <Skeleton width='20rem' height='2.8rem'/>
                        <Skeleton width='12rem' height='1.4rem'/>
                        <Skeleton width='10rem' height='1.4rem'/>
                    </div>

                    <Skeleton height='4.4rem' radius='1rem'/>
                    <Skeleton height='4.4rem' radius='1rem'/>
                </section>

                <section className={styles.section} aria-hidden='true'>
                    <h2><ScrollText aria-hidden='true'/>Resumo</h2>

                    <div className={styles.squares}>
                        {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => <StatCardSkeleton key={index} square/>)}
                    </div>
                </section>

                <section className={styles.section} aria-hidden='true'>
                    <h2><Sparkles aria-hidden='true'/>XP Total</h2>
                    <Skeleton height='22rem' radius='1rem'/>
                </section>

                <section className={styles.section} aria-hidden='true'>
                    <h2><Sparkles aria-hidden='true'/>XP Por dia</h2>
                    <Skeleton height='22rem' radius='1rem'/>
                </section>

                <section className={styles.section} aria-hidden='true'>
                    <h2><CheckLine className={styles.check} aria-hidden='true'/>Presença</h2>
                    <Skeleton height='14rem' radius='1rem'/>
                </section>

                <section className={styles.section} aria-hidden='true'>
                    <h2><CalendarDays aria-hidden='true'/>Atividades por dia</h2>
                    <Skeleton height='14rem' radius='1rem'/>
                </section>

                <section className={styles.section} aria-hidden='true'>
                    <h2><Route aria-hidden='true'/>Progresso na trilha</h2>

                    <div className={styles.cards}>
                        <StatCardSkeleton/>
                        <StatCardSkeleton/>
                    </div>
                </section>
            </main>
        </>
    );
}
