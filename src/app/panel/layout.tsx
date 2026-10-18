import type { ReactNode } from 'react';

import { getInitials } from '#/utils/getInitials';
import { getPanelData } from '#/utils/panelData';

import PanelShell from './PannelShell';

export default async function PanelLayout({ children }: { children: ReactNode }) {
    const { user } = await getPanelData();

    return (
        <PanelShell initials={getInitials(user.name)}>
            {children}
        </PanelShell>
    );
}