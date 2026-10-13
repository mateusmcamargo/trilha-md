import type { ReactNode } from 'react';

import Navbar from '#/components/Navbar/Navbar';

import styles from './layout.module.scss';

export default function TabsLayout({ children }: { children: ReactNode }) {
    return (
        <div className={styles.tabs}>
            {children}
            <Navbar/>
        </div>
    );
}