'use client';

import { useState } from 'react';

import { FlaskConical, X } from 'lucide-react';

import { Button } from '../Button/Button';
import { Modal } from '../Modal/Modal';

import styles from './MockAlert.module.scss';

interface MockAlertProps {
    onClose: () => void
}

export function MockAlert({onClose}: MockAlertProps) {
    const [open, setOpen] = useState(false);

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
                    <Button fullWidth variant='brand' data-autofocus onClick={() => setOpen(false)}>
                        Entendi
                    </Button>
                }
            >
                <ul className={styles.info}>
                    <li>Nomes, XP, presenças e demais informações são fictícios.</li>
                    <li>Nada do que você fizer aqui é salvo.</li>
                    <li>Algumas telas e ações podem não estar disponíveis.</li>
                </ul>
            </Modal>
        </>
    );
}
