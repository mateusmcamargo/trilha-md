'use client';

import { useState } from 'react';

import { Trash2 } from 'lucide-react';

import { Button } from './Button';
import { ConfirmDialog } from '../Modal/ConfirmDialog';

export function DeleteAccountButton() {
    const [open, setOpen] = useState(false);

    function handleConfirm() {
        // TODO: deactivate the account (soft delete) and end the session
        setOpen(false);
    }

    return (
        <>
            <Button
                icon={Trash2}
                variant='danger'
                fullWidth
                aria-haspopup='dialog'
                onClick={() => setOpen(true)}
            >
                Deletar conta
            </Button>

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