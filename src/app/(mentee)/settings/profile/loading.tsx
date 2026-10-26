import { ArrowLeft } from 'lucide-react';

import PageHeader from '#/components/Header/PageHeader';
import ProfileFormSkeleton from '#/components/ProfileForm/ProfileFormSkeleton';
import Skeleton from '#/components/Skeleton/Skeleton';

import styles from './page.module.scss';

// shown at once on navigation, while getMenteeData loads
export default function ProfileSettingsLoading() {
    return (
        <>
            <PageHeader
                title='Perfil'
                action={{ href: '/settings', label: 'Voltar', icon: ArrowLeft }}
            />

            <main
                className={`main-subpage ${styles.profile}`}
                aria-label='Editar perfil'
                aria-busy='true'
            >
                <p role='status' className='sr-only'>Carregando o perfil...</p>

                <Skeleton width='14rem' height='14rem' radius='50%'/>

                <ProfileFormSkeleton/>

                <section className={styles.account} aria-hidden='true'>
                    <Skeleton height='4.4rem' radius='1rem'/>
                    <Skeleton height='4.4rem' radius='1rem'/>
                </section>
            </main>
        </>
    );
}
