import type { Metadata } from 'next';

import { ArrowLeft, Download, Pencil } from 'lucide-react';

import { ActionButton } from '#/components/Button/ActionButton';
import { DeleteAccountButton } from '#/components/Button/DeleteAccountButton';
import PageHeader from '#/components/Header/PageHeader';
import PressableBase from '#/components/PressableBase/PressableBase';
import { ProfileForm } from '#/components/ProfileForm/ProfileForm';

import { user } from '#/utils/mockData';
import { getInitials } from '#/utils/getInitials';

import styles from './page.module.scss';

export const metadata: Metadata = {
    title: 'Perfil',
};

export default function ProfileSettingsPage() {
    const initials = getInitials(user.name);

    return (
        <>
            <PageHeader
                title='Perfil'
                action={{ href: '/panel/settings', label: 'Voltar', icon: ArrowLeft }}
            />

            <main
                className={styles.profile}
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
                    <ActionButton icon={Download}>Exportar meus dados</ActionButton>
                    <DeleteAccountButton/>
                </section>
            </main>
        </>
    );
}