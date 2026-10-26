import ProfileFormSkeleton from '#/components/ProfileForm/ProfileFormSkeleton';
import { SettingsPage } from '#/components/Settings/SettingsPage';

// shown at once on navigation, while getTeamData loads
export default function TeamProfileSettingsLoading() {
    return (
        <SettingsPage title='Perfil' backHref='/team/settings' loading>
            <ProfileFormSkeleton/>
        </SettingsPage>
    );
}
