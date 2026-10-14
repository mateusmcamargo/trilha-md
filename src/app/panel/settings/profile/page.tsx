import type { Metadata } from 'next';

import { ArrowLeft, Download, Pencil, Trash2 } from 'lucide-react';

import { ActionButton } from '#/components/Button/ActionButton';
import PageHeader from '#/components/Header/PageHeader';
import PressableBase from '#/components/PressableBase/PressableBase';
import { ProfileForm } from '#/components/ProfileForm/ProfileForm';

import { user } from '#/app/panel/mockData';

import styles from './page.module.scss';

export const metadata: Metadata = {
    title: 'Perfil',
};

export default function ProfileSettingsPage() {
    const names = user.name.trim().split(/\s+/);
    const initials = `${names[0][0]}${names.length > 1 ? names[names.length - 1][0] : ''}`.toUpperCase();

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
                    <ActionButton icon={Trash2} variant='danger'>Deletar conta</ActionButton>
                </section>
            </main>
        </>
    );
}