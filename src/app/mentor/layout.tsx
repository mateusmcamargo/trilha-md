'use client'

import Navbar from '#/components/Navbar/Navbar';
import { MockAlert } from '#/components/MockAlert/MockAlert';

import { useState, type ReactNode } from 'react';
import { isMockMode } from '#/utils/mockMode';

export default function MentorLayout({ children }: { children: ReactNode }) {

    const [showMockAlert, setShowMockAlert] = useState<boolean>(isMockMode);

    return (
        <div>
            {children}
            {isMockMode && showMockAlert &&
                <MockAlert onClick={() => setShowMockAlert(false)}/>
            }
        </div>
    );
}