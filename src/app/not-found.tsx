'use client'

import Link from 'next/link';

import PressableBase from '#/components/PressableBase/PressableBase';

import styles from './not-found.module.scss';
import { MockAlert } from '#/components/MockAlert/MockAlert';
import { useState } from 'react';
import { isMockMode } from '#/utils/mockMode';

export default function NotFound() {
    const [showMockAlert, setShowMockAlert] = useState<boolean>(isMockMode);

    return (
        <main className={styles.notFound}>
            <div className={styles.message}>
                <h1>Ops! Não tem nada aqui!</h1>
                <p>Acho que esqueceram de<br/>programar essa parte... <span aria-hidden='true'>😳</span></p>
            </div>

            <PressableBase color='var(--color-brand-darker)' radius='1rem'>
                <Link href='/panel/trail' className={styles.button}>
                    Voltar para a sua trilha
                </Link>
            </PressableBase>

            {isMockMode && showMockAlert &&
                <MockAlert onClick={() => setShowMockAlert(false)}/>
            }
        </main>
    );
}