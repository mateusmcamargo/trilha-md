import type { Metadata } from 'next';

import { ProfileForm } from '#/components/ProfileForm/ProfileForm';
import { SettingsPage } from '#/components/Settings/SettingsPage';

import { isSkeletonPreview } from '#/utils/skeletonPreview';
import { getTeamData } from '#/utils/teamData';

import TeamProfileSettingsLoading from './loading';

export const metadata: Metadata = {
    title: 'Perfil',
};

export default async function TeamProfileSettingsPage() {
    // demo mode with the data turned off
    if (await isSkeletonPreview()) return <TeamProfileSettingsLoading/>;

    const { user } = await getTeamData();

    return (
        <SettingsPage title='Perfil' backHref='/team/settings'>
            <ProfileForm user={user}/>
        </SettingsPage>
    );
}
