import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';

import PanelShell from '#/components/PanelShell/PanelShell';
import { getInitials } from '#/utils/getInitials';
import type { Theme } from '#/utils/appearance';
import { isMockMode } from '#/utils/mockMode';
import { getPreferences } from '#/utils/preferences';
import { isSkeletonPreview } from '#/utils/skeletonPreview';
import { getTeamData } from '#/utils/teamData';

export default async function TeamLayout({ children }: { children: ReactNode }) {
    const [{ user }, preferences] = await Promise.all([getTeamData(), getPreferences()]);

    if (user.role !== 'mentor') redirect('/trail');

    return (
        <PanelShell
            role='mentor'
            initials={getInitials(user.name)}
            skeletonPreview={await isSkeletonPreview()}
            appearance={isMockMode ? undefined : {
                theme: preferences.theme as Theme,
                animations: preferences.animations_enabled,
            }}
        >
            {children}
        </PanelShell>
    );
}