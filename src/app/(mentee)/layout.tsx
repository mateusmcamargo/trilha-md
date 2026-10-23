import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';

import PanelShell from '#/components/PanelShell/PanelShell';
import { getInitials } from '#/utils/getInitials';
import { getMenteeData } from '#/utils/menteeData';
import { isSkeletonPreview } from '#/utils/skeletonPreview';

export default async function PanelLayout({ children }: { children: ReactNode }) {
    const { user } = await getMenteeData();

    // mentors have their own area
    if (user.role === 'mentor') redirect('/team/dashboard');

    return (
        <PanelShell
            role='mentee'
            initials={getInitials(user.name)}
            skeletonPreview={await isSkeletonPreview()}
        >
            {children}
        </PanelShell>
    );
}