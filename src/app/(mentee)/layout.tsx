import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';

import PanelShell from '#/components/PanelShell/PanelShell';
import { getInitials } from '#/utils/getInitials';
import { getMenteeData } from '#/utils/menteeData';
import type { Theme } from '#/utils/appearance';
import { isMockMode } from '#/utils/mockMode';
import { getPreferences } from '#/utils/preferences';
import { isSkeletonPreview } from '#/utils/skeletonPreview';

export default async function PanelLayout({ children }: { children: ReactNode }) {
    const [{ user }, preferences] = await Promise.all([getMenteeData(), getPreferences()]);

    // mentors have their own area
    if (user.role === 'mentor') redirect('/team/dashboard');

    return (
        <PanelShell
            role='mentee'
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