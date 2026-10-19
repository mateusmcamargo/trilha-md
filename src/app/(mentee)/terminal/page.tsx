import type { Metadata } from 'next';

import CodeSandbox from '#/components/CodeSandbox/CodeSandbox';
import StatsHeader from '#/components/Header/StatsHeader';

export const metadata: Metadata = {
    title: 'Terminal',
};

export default function TerminalPage() {

    return (
        <>
            <StatsHeader/>

            <main
                className={`main-tabs`}
                style={{height: 'calc(100vh - 2 * var(--bar-height))'}}
                aria-label='Terminal de código'
            >
                <h1 className='sr-only'>Terminal</h1>
                <CodeSandbox/>
            </main>
        </>
    );
}