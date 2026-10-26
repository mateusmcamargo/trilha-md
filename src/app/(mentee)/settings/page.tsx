import type { Metadata } from 'next';

import { ArrowLeft } from 'lucide-react';

import { LogoutButton } from '#/components/Button/LogoutButton';
import PageHeader from '#/components/Header/PageHeader';
import { SettingsMenu } from '#/components/Settings/SettingsMenu';

import { settingsSections } from './links';

import styles from './page.module.scss';

export const metadata: Metadata = {
    title: 'Configurações',
};

export default function SettingsPage() {
    return (
        <>
            <PageHeader
                title='Configurações'
                action={{ href: '/profile', label: 'Voltar', icon: ArrowLeft }}
            />

            <main
                className={`main-subpage ${styles.settings}`}
                aria-label='Configurações'
            >
                <SettingsMenu sections={settingsSections} basePath='/settings'/>

                <section className={styles.logout}>
                    <LogoutButton/>
                </section>
            </main>
        </>
    );
}
