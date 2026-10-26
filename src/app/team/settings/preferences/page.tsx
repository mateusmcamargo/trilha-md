import type { Metadata } from 'next';

import { PreferencesForm } from '#/components/Settings/PreferencesForm';
import { SettingsPage } from '#/components/Settings/SettingsPage';

import { getPreferences } from '#/utils/preferences';
import { isSkeletonPreview } from '#/utils/skeletonPreview';

import TeamPreferencesLoading from './loading';

export const metadata: Metadata = {
    title: 'Preferências',
};

export default async function TeamPreferencesPage() {
    // demo mode with the data turned off
    if (await isSkeletonPreview()) return <TeamPreferencesLoading/>;

    const preferences = await getPreferences();

    return (
        <SettingsPage title='Preferências' backHref='/team/settings'>
            <PreferencesForm preferences={preferences} trailOptions={false}/>
        </SettingsPage>
    );
}
