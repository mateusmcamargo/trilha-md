import type { Metadata } from 'next';

import CodeSandbox from '#/components/CodeSandbox/CodeSandbox';
import StatsHeader from '#/components/Header/StatsHeader';

import { stats, trailProgress } from '#/app/pannel/mockData';

import styles from './page.module.scss';

export const metadata: Metadata = {
    title: 'Terminal',
};

export default function TerminalPage() {
    return (
        <>
            <StatsHeader
                progress={trailProgress}
                xp={stats.xp}
                streak={stats.streak}
                life={stats.life}
            />

            <main
                className={styles.terminal}
                aria-label='Terminal de código'
            >
                <CodeSandbox/>
            </main>
        </>
    );
}