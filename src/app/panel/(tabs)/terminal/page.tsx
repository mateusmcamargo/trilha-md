import type { Metadata } from 'next';

import CodeSandbox from '#/components/CodeSandbox/CodeSandbox';
import StatsHeader from '#/components/Header/StatsHeader';

import styles from './page.module.scss';

export const metadata: Metadata = {
    title: 'Terminal',
};

export default function TerminalPage() {

    return (
        <>
            <StatsHeader/>

            <main
                className={styles.terminal}
                aria-label='Terminal de código'
            >
                <h1 className='sr-only'>Terminal</h1>
                <CodeSandbox/>
            </main>
        </>
    );
}