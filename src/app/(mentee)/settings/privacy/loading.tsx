import SettingsSkeleton from '#/components/Settings/SettingsSkeleton';
import { SettingsPage } from '#/components/Settings/SettingsPage';

// shown at once on navigation, while getPreferences loads
export default function PrivacyLoading() {
    return (
        <SettingsPage title='Privacidade' backHref='/settings' loading>
            <SettingsSkeleton sections={[{ title: 'Comunidade', kind: 'switch', rows: 2 }]}/>
        </SettingsPage>
    );
}
