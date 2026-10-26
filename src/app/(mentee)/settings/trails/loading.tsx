import SettingsSkeleton from '#/components/Settings/SettingsSkeleton';
import { SettingsPage } from '#/components/Settings/SettingsPage';

// shown at once on navigation, while getMenteeData loads
export default function TrailsLoading() {
    return (
        <SettingsPage title='Trilhas' backHref='/settings' loading>
            <SettingsSkeleton sections={[{ title: 'Suas trilhas', kind: 'card', rows: 2 }]}/>
        </SettingsPage>
    );
}
