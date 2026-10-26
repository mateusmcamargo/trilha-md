import type { Metadata } from 'next';

import { ArrowLeft, Download, Pencil } from 'lucide-react';

import { Button } from '#/components/Button/Button';
import { DeleteAccountButton } from '#/components/Button/DeleteAccountButton';
import PageHeader from '#/components/Header/PageHeader';
import { ProfileForm } from '#/components/ProfileForm/ProfileForm';

import { getInitials } from '#/utils/getInitials';
import { getMenteeData } from '#/utils/menteeData';
import { isSkeletonPreview } from '#/utils/skeletonPreview';

import ProfileSettingsLoading from './loading';

import styles from './page.module.scss';

export const metadata: Metadata = {
    title: 'Perfil',
};

export default async function ProfileSettingsPage() {
    // demo mode with the data turned off
    if (await isSkeletonPreview()) return <ProfileSettingsLoading/>;

    const { user } = await getMenteeData();
    const initials = getInitials(user.name);

    return (
        <>
            <PageHeader
                title='Perfil'
                action={{ href: '/settings', label: 'Voltar', icon: ArrowLeft }}
            />

            <main
                className={`main-subpage ${styles.profile}`}
                aria-label='Editar perfil'
            >
                <div className={styles.avatar}>
                    <div
                        className={styles.picture}
                        role='img'
                        aria-label={`Avatar de ${user.name}`}
                    >
                        <span aria-hidden='true'>{initials}</span>
                    </div>
                        <button
                            type='button'
                            className={styles.editButton}
                            aria-label='Editar avatar'
                        >
                            <Pencil aria-hidden='true'/>
                        </button>
                </div>

                <ProfileForm user={user}/>

                <section className={styles.account} aria-label='Dados e conta'>
                    {/* route handler: download skips the client navigation, no prefetch of the file */}
                    <Button icon={Download} fullWidth href='/settings/export' download prefetch={false}>
                        Exportar meus dados
                    </Button>
                    <DeleteAccountButton/>
                </section>
            </main>
        </>
    );
}