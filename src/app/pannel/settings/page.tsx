import type { Metadata } from 'next';

import { ArrowLeft } from 'lucide-react';

import PageHeader from '#/components/Header/PageHeader';

import styles from './page.module.scss';

export const metadata: Metadata = {
    title: 'Configurações',
};

export default function SettingsPage() {
    return (
        <>
            <PageHeader
                title='Configurações'
                action={{ href: '/pannel/profile', label: 'Voltar', icon: ArrowLeft }}
            />

            <main
                className={styles.settings}
                aria-label='Configurações'
            >
                <p>Em breve.</p>
            </main>
        </>
    );
}