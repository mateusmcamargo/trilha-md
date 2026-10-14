'use client';

import { useState } from 'react';

import { Trash2 } from 'lucide-react';

import { ActionButton } from './ActionButton';
import { ConfirmDialog } from '../Modal/ConfirmDialog';

export function DeleteAccountButton() {
    const [open, setOpen] = useState(false);

    function handleConfirm() {
        // TODO: desativar a conta (soft delete) e encerrar a sessão
        setOpen(false);
    }

    return (
        <>
            <ActionButton
                icon={Trash2}
                variant='danger'
                aria-haspopup='dialog'
                onClick={() => setOpen(true)}
            >
                Deletar conta
            </ActionButton>

            <ConfirmDialog
                open={open}
                onClose={() => setOpen(false)}
                onConfirm={handleConfirm}
                title='Deletar sua conta?'
                description='Sua conta será desativada e você será desconectada. Tem certeza de que deseja continuar?'
                confirmLabel='Sim, deletar conta'
                variant='danger'
                icon={Trash2}
            />
        </>
    );
}