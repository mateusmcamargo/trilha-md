import type { Metadata } from 'next';

import { ArrowLeft } from 'lucide-react';

import { LogoutButton } from '#/components/Button/LogoutButton';
import PageHeader from '#/components/Header/PageHeader';
import { SettingsMenu } from '#/components/Settings/SettingsMenu';

import { teamSettingsSections } from './links';

import styles from '#/components/Settings/Settings.module.scss';

export const metadata: Metadata = {
    title: 'Configurações',
};

export default function TeamSettingsPage() {
    return (
        <>
            <PageHeader
                title='Configurações'
                action={{ href: '/team/dashboard', label: 'Voltar', icon: ArrowLeft }}
            />

            <main className='main-subpage' aria-label='Configurações'>
                <SettingsMenu sections={teamSettingsSections} basePath='/team/settings'/>

                <section className={styles.section}>
                    <LogoutButton/>
                </section>
            </main>
        </>
    );
}
