import SettingsSkeleton from '#/components/Settings/SettingsSkeleton';
import { SettingsPage } from '#/components/Settings/SettingsPage';

// shown at once on navigation, while the reports load
export default function ReportsLoading() {
    return (
        <SettingsPage title='Denúncias' backHref='/team/settings' loading>
            <SettingsSkeleton sections={[{ title: 'Todas as denúncias', kind: 'card', rows: 2 }]}/>
        </SettingsPage>
    );
}
