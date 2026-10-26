'use client';

import { useState } from 'react';

import { FlaskConical, SearchX, TriangleAlert, X } from 'lucide-react';

import { Button } from '#/components/Button/Button';
import { Modal } from '#/components/Modal/Modal';
import { SkeletonAlert } from '#/components/SkeletonAlert/SkeletonAlert';

import styles from './MockAlert.module.scss';

interface MockAlertProps {
    onClose: () => void
    // only areas with skeletons pass it (shows the SkeletonAlert switch)
    skeletonPreview?: boolean
}

export function MockAlert({onClose, skeletonPreview}: MockAlertProps) {
    const [open, setOpen] = useState(false);
    const [crash, setCrash] = useState(false);

    // demo mode: throwing on render shows the error screen (app/error.tsx)
    if (crash) throw new Error('Prévia da tela de erro (modo demonstração)');

    return (
        <>
            <div className={styles.mockAlert}>
                <button
                    className={styles.openButton}
                    onClick={() => setOpen(true)}
                    aria-haspopup='dialog'
                    aria-label='Saiba mais sobre o modo demonstração'
                    title='Modo Demonstração'
                >
                    <FlaskConical/>
                </button>

                <button
                    className={styles.closeButton}
                    onClick={() => onClose()}
                    aria-label='Fechar aviso de demonstração'
                >
                    <X/>
                </button>
            </div>

            <Modal
                open={open}
                onClose={() => setOpen(false)}
                icon={FlaskConical}
                title='Modo demo'
                description='Você está vendo o Áster com dados de exemplo. Pode explorar à vontade!'
                actions={
                    <>
                        <Button
                            fullWidth
                            variant='outline'
                            icon={TriangleAlert}
                            onClick={() => setCrash(true)}
                        >
                            Ver tela de erro
                        </Button>

                        <Button
                            fullWidth
                            variant='outline'
                            icon={SearchX}
                            href='/preview-404'
                        >
                            Ver tela 404
                        </Button>

                        <Button
                            fullWidth
                            variant='brand'
                            data-autofocus
                            onClick={() => setOpen(false)}
                        >
                            Entendi
                        </Button>
                    </>
                }
            >
                <ul className={styles.info}>
                    <li>Nomes, XP, presenças e demais informações são fictícios.</li>
                    <li>Nada do que você fizer aqui é salvo.</li>
                    <li>Algumas telas e ações podem não estar disponíveis.</li>
                </ul>

                {skeletonPreview !== undefined &&
                    <SkeletonAlert skeletonPreview={skeletonPreview}/>
                }
            </Modal>
        </>
    );
}
