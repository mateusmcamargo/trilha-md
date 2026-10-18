'use client'

import { useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';

import Navbar from '#/components/Navbar/Navbar';

import styles from './layout.module.scss';
import { MockAlert } from '#/components/MockAlert/MockAlert';
import { isMockMode } from '#/utils/mockMode';

const pathsWithoutNavbar = ['/panel/settings'];

interface PanelShellProps {
    initials: string;
    children: ReactNode;
}

export default function PanelShell({ initials, children }: PanelShellProps) {

    const pathname = usePathname();
    const hideNavbar = pathsWithoutNavbar.some((path) =>
        pathname === path || pathname.startsWith(`${path}/`));

    const [showMockAlert, setShowMockAlert] = useState<boolean>(isMockMode);

    return (
        <div className={styles.tabs}>
            {children}
            {!hideNavbar && <Navbar initials={initials}/>}
            
            {isMockMode && showMockAlert &&
                <MockAlert onClick={() => setShowMockAlert(false)}/>
            }
        </div>
    );
}