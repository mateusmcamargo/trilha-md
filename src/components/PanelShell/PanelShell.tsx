'use client'

import { useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';

import { MockAlert } from '#/components/MockAlert/MockAlert';
import Navbar, { type NavRole } from '#/components/Navbar/Navbar';
import { SoundProvider } from '#/components/SoundProvider/SoundProvider';
import { applyAppearance, appearanceChanged, type Theme } from '#/utils/appearance';
import { isMockMode } from '#/utils/mockMode';

import styles from './PanelShell.module.scss';

interface PanelShellProps {
    role: NavRole;
    initials: string;
    // demo mode: only areas with skeletons pass it (shows the SkeletonAlert switch)
    skeletonPreview?: boolean;
    // saved preferences; without it (demo mode) the device cookies are kept
    appearance?: { theme: Theme; animations: boolean };
    // "Efeitos sonoros" in the preferences
    sounds: boolean;
    children: ReactNode;
}

export default function PanelShell({ role, initials, skeletonPreview, appearance, sounds, children }: PanelShellProps) {

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

    // another device may have changed the theme: brings this one up to date
    const theme = appearance?.theme;
    const animations = appearance?.animations;
    useEffect(() => {
        if (theme === undefined || animations === undefined) return;
        if (appearanceChanged(theme, animations)) applyAppearance(theme, animations);
    }, [theme, animations]);

    return (
        <div className={styles.tabs}>
            <SoundProvider initialEnabled={sounds}>
                {children}
                {!hideNavbar && <Navbar role={role} initials={initials}/>}
            </SoundProvider>
            
            {isMockMode && showMockAlert && (
                <MockAlert
                    skeletonPreview={skeletonPreview}
                    onClose={() => setShowMockAlert(false)}
                />
            )}
        </div>
    );
}