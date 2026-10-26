import type { Metadata } from 'next';

import { AboutProject } from '#/components/Settings/AboutProject';
import { SettingsPage } from '#/components/Settings/SettingsPage';

export const metadata: Metadata = {
    title: 'Sobre o Meninas Digitais',
};

export default function AboutProjectPage() {
    return (
        <SettingsPage title='Sobre o Meninas Digitais' backHref='/settings'>
            <AboutProject/>
        </SettingsPage>
    );
}
