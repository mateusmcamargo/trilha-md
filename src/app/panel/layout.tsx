'use client'

import { useState, type ReactNode } from 'react';

import Navbar from '#/components/Navbar/Navbar';

import styles from './layout.module.scss';
import { MockAlert } from '#/components/MockAlert/MockAlert';
import { isMockMode } from '#/utils/mockMode';

export default function TabsLayout({ children }: { children: ReactNode }) {

    const [showMockAlert, setShowMockAlert] = useState<boolean>(isMockMode);

    return (
        <div className={styles.tabs}>
            {children}
            <Navbar/>
            
            {isMockMode && showMockAlert &&
                <MockAlert onClick={() => setShowMockAlert(false)}/>
            }
        </div>
    );
}