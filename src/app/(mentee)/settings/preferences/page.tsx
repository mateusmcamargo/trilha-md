import type { Metadata } from 'next';

import { PreferencesForm } from '#/components/Settings/PreferencesForm';
import { SettingsPage } from '#/components/Settings/SettingsPage';

import { getPreferences } from '#/utils/preferences';
import { isSkeletonPreview } from '#/utils/skeletonPreview';

import PreferencesLoading from './loading';

export const metadata: Metadata = {
    title: 'Preferências',
};

export default async function PreferencesPage() {
    // demo mode with the data turned off
    if (await isSkeletonPreview()) return <PreferencesLoading/>;

    const preferences = await getPreferences();

    return (
        <SettingsPage title='Preferências' backHref='/settings'>
            <PreferencesForm preferences={preferences}/>
        </SettingsPage>
    );
}
