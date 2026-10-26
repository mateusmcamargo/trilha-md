import SettingsSkeleton from '#/components/Settings/SettingsSkeleton';
import { SettingsPage } from '#/components/Settings/SettingsPage';

// shown at once on navigation, while getPreferences loads
export default function PreferencesLoading() {
    return (
        <SettingsPage title='Preferências' backHref='/settings' loading>
            <SettingsSkeleton sections={[
                { title: 'Sua trilha', kind: 'switch', rows: 3 },
                { title: 'Aparência', kind: 'toggle' },
            ]}/>
        </SettingsPage>
    );
}
