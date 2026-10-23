'use client'

import { useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';

import Navbar, { type NavRole } from '#/components/Navbar/Navbar';

import styles from './PanelShell.module.scss';
import { MockAlert } from '#/components/MockAlert/MockAlert';
import { SkeletonAlert } from '#/components/SkeletonAlert/SkeletonAlert';
import { isMockMode } from '#/utils/mockMode';

interface PanelShellProps {
    role: NavRole;
    initials: string;
    // demo mode: only areas with skeletons pass it (shows the SkeletonAlert switch)
    skeletonPreview?: boolean;
    children: ReactNode;
}

export default function PanelShell({ role, initials, skeletonPreview, children }: PanelShellProps) {

    const pathname = usePathname();

    // sets pages without navbar (may be changed in the future)
    const settingsPath = role === 'mentor' ? '/team/settings' : '/settings';
    const hideNavbar = pathname === settingsPath || pathname.startsWith(`${settingsPath}/`)
        // inside an activity: only the header
        || pathname.startsWith('/trail/')
        || pathname.startsWith('/checkin/')
        // editing an activity
        || pathname.startsWith('/team/create/');

    const [showMockAlert, setShowMockAlert] = useState<boolean>(isMockMode);

    return (
        <div className={styles.tabs}>
            {children}
            {!hideNavbar && <Navbar role={role} initials={initials}/>}
            
            {isMockMode && showMockAlert && (
                <>
                    {skeletonPreview !== undefined &&
                        <SkeletonAlert skeletonPreview={skeletonPreview}/>
                    }
                    <MockAlert onClose={() => setShowMockAlert(false)}/>
                </>
            )}
        </div>
    );
}