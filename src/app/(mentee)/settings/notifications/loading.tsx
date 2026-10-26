import SettingsSkeleton from '#/components/Settings/SettingsSkeleton';
import { SettingsPage } from '#/components/Settings/SettingsPage';

// shown at once on navigation, while getPreferences loads
export default function NotificationsLoading() {
    return (
        <SettingsPage title='Notificações' backHref='/settings' loading>
            <SettingsSkeleton sections={[{ title: 'Me avise sobre', kind: 'switch', rows: 3 }]}/>
        </SettingsPage>
    );
}
