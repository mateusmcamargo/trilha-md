'use client';

import { useEffect } from 'react';

import { RotateCcw } from 'lucide-react';

import { Button } from '#/components/Button/Button';

import styles from './not-found.module.scss';

interface ErrorPageProps {
    error: Error & { digest?: string };
    retry: () => void;
}

export default function ErrorPage({ error, retry }: ErrorPageProps) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <main className={`main-fullscreen ${styles.notFound}`}>
            <div className={styles.message}>
                <h1>Ops! Algo deu errado</h1>
                <p>Não conseguimos carregar seus dados.<br/>Tente de novo em instantes.</p>
            </div>

            <Button variant='brand' icon={RotateCcw} onClick={() => retry()}>
                Tentar de novo
            </Button>
        </main>
    );
}
