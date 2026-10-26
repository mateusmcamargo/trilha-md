import { ArrowLeft } from 'lucide-react';

import PageHeader from '#/components/Header/PageHeader';
import Skeleton from '#/components/Skeleton/Skeleton';

import styles from './page.module.scss';

// shown at once while check_in runs: same card as the result
export default function CheckinLoading() {
    return (
        <>
            <PageHeader title='Presença' action={{ href: '/trail', label: 'Voltar à trilha', icon: ArrowLeft }}/>

            <main className='main-subpage' aria-label='Confirmação de presença' aria-busy='true'>
                <p role='status' className='sr-only'>Confirmando a presença...</p>

                <section className={styles.card} aria-hidden='true'>
                    <Skeleton width='6.4rem' height='6.4rem' radius='50%'/>
                    <Skeleton width='22rem' height='2.4rem'/>
                    <Skeleton width='16rem' height='1.8rem'/>
                    <Skeleton width='8rem' height='1.8rem'/>

                    <div className={styles.actions}>
                        <Skeleton height='4.4rem' radius='1rem'/>
                        <Skeleton height='4.4rem' radius='1rem'/>
                    </div>
                </section>
            </main>
        </>
    );
}
