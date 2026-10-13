import type { Metadata } from 'next';

import { ArrowLeft } from 'lucide-react';

import PageHeader from '#/components/Header/PageHeader';

import styles from './page.module.scss';
import { LogoutButton } from '#/components/Button/LogoutButton';

export const metadata: Metadata = {
    title: 'Configurações',
};

export default function SettingsPage() {
    return (
        <>
            <PageHeader
                title='Configurações'
                action={{ href: '/panel/profile', label: 'Voltar', icon: ArrowLeft }}
            />

            <main
                className={styles.settings}
                aria-label='Configurações'
            >
                <section className={styles.logout}>
                    <LogoutButton/>
                </section>
            </main>
        </>
    );
}