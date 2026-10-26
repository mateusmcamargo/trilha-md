import type { Metadata } from 'next';

import { DataDisclaimer } from '#/components/Settings/DataDisclaimer';
import { SettingsPage } from '#/components/Settings/SettingsPage';

export const metadata: Metadata = {
    title: 'Sobre os dados',
};

export default function TeamPrivacyDisclaimerPage() {
    return (
        <SettingsPage title='Sobre os dados' backHref='/team/settings'>
            <DataDisclaimer area='mentor'/>
        </SettingsPage>
    );
}
