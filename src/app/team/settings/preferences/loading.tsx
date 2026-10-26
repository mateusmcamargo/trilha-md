import SettingsSkeleton from '#/components/Settings/SettingsSkeleton';
import { SettingsPage } from '#/components/Settings/SettingsPage';

// shown at once on navigation, while getPreferences loads
export default function TeamPreferencesLoading() {
    return (
        <SettingsPage title='Preferências' backHref='/team/settings' loading>
            <SettingsSkeleton sections={[
                { title: 'Movimento', kind: 'switch', rows: 1 },
                { title: 'Aparência', kind: 'toggle' },
            ]}/>
        </SettingsPage>
    );
}
