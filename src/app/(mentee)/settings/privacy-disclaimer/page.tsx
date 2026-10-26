import type { Metadata } from 'next';

import { DataDisclaimer } from '#/components/Settings/DataDisclaimer';
import { SettingsPage } from '#/components/Settings/SettingsPage';

export const metadata: Metadata = {
    title: 'Sobre os seus dados',
};

export default function PrivacyDisclaimerPage() {
    return (
        <SettingsPage title='Sobre os seus dados' backHref='/settings'>
            <DataDisclaimer area='mentee'/>
        </SettingsPage>
    );
}
