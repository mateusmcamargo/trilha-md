'use client'

import { Button } from '#/components/Button/Button';

import styles from './not-found.module.scss';
import { MockAlert } from '#/components/MockAlert/MockAlert';
import { useState } from 'react';
import { isMockMode } from '#/utils/mockMode';

export default function NotFound() {
    const [showMockAlert, setShowMockAlert] = useState<boolean>(isMockMode);

    return (
        <main className={`main-fullscreen ${styles.notFound}`}>
            <div className={styles.message}>
                <h1>Ops! Não tem nada aqui!</h1>
                <p>Acho que esqueceram de<br/>programar essa parte... <span aria-hidden='true'>😳</span></p>
            </div>

            <Button href='/trail' variant='brand'>
                Voltar para a sua trilha
            </Button>

            {isMockMode && showMockAlert &&
                <MockAlert onClick={() => setShowMockAlert(false)}/>
            }
        </main>
    );
}