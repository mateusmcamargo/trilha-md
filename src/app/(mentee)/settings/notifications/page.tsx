import type { Metadata } from 'next';

import { PreferenceSwitches } from '#/components/Settings/PreferenceSwitches';
import { SettingsPage } from '#/components/Settings/SettingsPage';
import { notificationGroups } from '#/components/Settings/switchGroups';

import { getPreferences } from '#/utils/preferences';
import { isSkeletonPreview } from '#/utils/skeletonPreview';

import NotificationsLoading from './loading';


export const metadata: Metadata = {
    title: 'Notificações',
};

export default async function NotificationsPage() {
    // demo mode with the data turned off
    if (await isSkeletonPreview()) return <NotificationsLoading/>;

    const preferences = await getPreferences();

    return (
        <SettingsPage title='Notificações' backHref='/settings'>
            <PreferenceSwitches groups={notificationGroups} preferences={preferences}/>
        </SettingsPage>
    );
}
