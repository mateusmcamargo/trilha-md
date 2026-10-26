import StatsHeaderSkeleton from '#/components/Header/StatsHeaderSkeleton';
import Skeleton from '#/components/Skeleton/Skeleton';

import styles from '#/components/CodeSandbox/CodeSandbox.module.scss';

// shown at once on navigation, while getMenteeData loads the header stats
export default function TerminalLoading() {
    return (
        <>
            <StatsHeaderSkeleton/>

            <main
                className={`main-tabs`}
                style={{height: 'calc(100vh - 2 * var(--bar-height))'}}
                aria-label='Terminal de código'
                aria-busy='true'
            >
                <h1 className='sr-only'>Terminal</h1>
                <p role='status' className='sr-only'>Carregando o terminal...</p>

                <div className={styles.sandbox} style={{height: 'calc(100vh - 2 * var(--bar-height))'}}>
                    <Skeleton height='100%' radius='1rem'/>
                    <Skeleton width='12rem' height='1.6rem'/>
                </div>
            </main>
        </>
    );
}
