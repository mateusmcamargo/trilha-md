import type { Metadata } from 'next';

import { AboutApp } from '#/components/Settings/AboutApp';
import { SettingsPage } from '#/components/Settings/SettingsPage';

export const metadata: Metadata = {
    title: 'Sobre o aplicativo',
};

export default function TeamAboutAppPage() {
    return (
        <SettingsPage title='Sobre o aplicativo' backHref='/team/settings'>
            <AboutApp contactHref='/team/settings/contact-developer'/>
        </SettingsPage>
    );
}
