import SettingsSkeleton from '#/components/Settings/SettingsSkeleton';
import { SettingsPage } from '#/components/Settings/SettingsPage';

// shown at once on navigation, while the mentor's contact loads
export default function ContactMentorLoading() {
    return (
        <SettingsPage title='Contactar sua mentora' backHref='/settings' loading>
            <SettingsSkeleton sections={[{ title: 'Sua mentora', kind: 'toggle', rows: 2 }]}/>
        </SettingsPage>
    );
}
