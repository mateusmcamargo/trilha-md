'use client';

import { useState } from 'react';
import Skeleton from '#/components/Skeleton/Skeleton';
import styles from './CodeSandbox.module.scss';

const CODEPEN_USER = 'Mateus-Camargo-the-flexboxer';
const CODEPEN_PEN  = '01a131ac-10fc-7d82-8dc8-91f4e4c9f43d';

const params = new URLSearchParams({
    'default-tab': 'html,result',
    'theme-id': 'dark',
    editable: 'true',
});

const embedUrl = `https://codepen.io/${CODEPEN_USER}/embed/${CODEPEN_PEN}?${params}`;
const penUrl   = `https://codepen.io/${CODEPEN_USER}/pen/${CODEPEN_PEN}`;

export default function CodeSandbox() {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <div className={styles.sandbox} style={{height: 'calc(100vh - 2 * var(--bar-height))'}}>
            <div className={styles.frameWrapper} aria-busy={!isLoaded}>
                {!isLoaded && (
                    <Skeleton
                        className={styles.skeleton}
                        height='100%'
                        radius='1rem'
                        label='Carregando editor de código...'
                    />
                )}

                <iframe
                    className={`${styles.frame} ${isLoaded ? styles.loaded : ''}`}
                    title='Editor de código'
                    src={embedUrl}
                    loading='lazy'
                    onLoad={() => setIsLoaded(true)}
                />
            </div>

            <a
                className={styles.link}
                href={penUrl}
                target='_blank'
                rel='noopener noreferrer'
            >
                Abrir no CodePen
            </a>
        </div>
    );
}