import type { Metadata } from 'next';

import { AboutApp } from '#/components/Settings/AboutApp';
import { SettingsPage } from '#/components/Settings/SettingsPage';

export const metadata: Metadata = {
    title: 'Sobre o aplicativo',
};

export default function AboutAppPage() {
    return (
        <SettingsPage title='Sobre o aplicativo' backHref='/settings'>
            <AboutApp contactHref='/settings/contact-developer'/>
        </SettingsPage>
    );
}
