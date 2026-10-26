import { Settings, TerminalSquare } from 'lucide-react';

import CommunitySectionSkeleton from '#/components/CommunitySection/CommunitySectionSkeleton';
import { Button } from '#/components/Button/Button';
import PageHeader from '#/components/Header/PageHeader';
import Skeleton from '#/components/Skeleton/Skeleton';

import styles from './page.module.scss';

// shown at once on navigation, while getMenteeData loads
export default function ProfileLoading() {
    return (
        <>
            <PageHeader
                title='Perfil'
                action={{ href: '/settings', label: 'Configurações', icon: Settings }}
            />

            <main
                className={`main-tabs ${styles.profile}`}
                aria-label='Meu Perfil'
                aria-busy='true'
            >
                <p role='status' className='sr-only'>Carregando o perfil...</p>

                <div className={styles.calling}>
                    <Skeleton width='14rem' height='2.4rem'/>
                    <div className={styles.action}>
                        <span>Bora codar no </span>
                        <Button href='/terminal' variant='brand' icon={TerminalSquare}>
                            Terminal
                        </Button>
                        <span>?</span>
                    </div>
                </div>

                <Skeleton width='90vw' height='60vw' radius='1rem'/>

                <div className={styles.userInfo} aria-hidden='true'>
                    <Skeleton width='70%' height='1.4rem'/>
                    <Skeleton width='50%' height='1.4rem'/>
                </div>

                <div className={styles.userStats} aria-hidden='true'>
                    <h2>Estatísticas</h2>

                    <div className={styles.cards}>
                        {[0, 1, 2, 3].map((index) => (
                            <Skeleton key={index} height='8.4rem' radius='2rem'/>
                        ))}
                    </div>
                </div>

                <CommunitySectionSkeleton/>
            </main>
        </>
    );
}
