import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';

import PanelShell from '#/components/PanelShell/PanelShell';
import { getInitials } from '#/utils/getInitials';
import { getTeamData } from '#/utils/teamData';

export default async function TeamLayout({ children }: { children: ReactNode }) {
    const { user } = await getTeamData();

    if (user.role !== 'mentor') redirect('/trail');

    return (
        <PanelShell role='mentor' initials={getInitials(user.name)}>
            {children}
        </PanelShell>
    );
}