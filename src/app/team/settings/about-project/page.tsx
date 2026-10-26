import type { Metadata } from 'next';

import { AboutProject } from '#/components/Settings/AboutProject';
import { SettingsPage } from '#/components/Settings/SettingsPage';

export const metadata: Metadata = {
    title: 'Sobre o Meninas Digitais',
};

export default function TeamAboutProjectPage() {
    return (
        <SettingsPage title='Sobre o Meninas Digitais' backHref='/team/settings'>
            <AboutProject/>
        </SettingsPage>
    );
}
