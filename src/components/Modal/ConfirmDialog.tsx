'use client';

import type { LucideIcon } from 'lucide-react';

import { Button } from '../Button/Button';
import { Modal } from './Modal';

interface ConfirmDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description?: string;
    confirmLabel?: string;
    loadingLabel?: string;
    cancelLabel?: string;
    variant?: 'neutral' | 'danger';
    icon: LucideIcon;
    loading?: boolean;
}

export function ConfirmDialog({
    open,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel = 'Confirmar',
    loadingLabel,
    cancelLabel = 'Cancelar',
    variant = 'neutral',
    icon,
    loading = false,
}: ConfirmDialogProps) {
    return (
        <Modal
            open={open}
            onClose={onClose}
            title={title}
            icon={icon}
            description={description}
            dismissible={!loading}
            actions={
                <>
                    <Button
                        fullWidth
                        variant={variant}
                        icon={icon}
                        disabled={loading}
                        aria-busy={loading}
                        onClick={onConfirm}
                    >
                        {loading && loadingLabel ? loadingLabel : confirmLabel}
                    </Button>

                    <Button
                        fullWidth
                        data-autofocus
                        disabled={loading}
                        onClick={onClose}
                    >
                        {cancelLabel}
                    </Button>
                </>
            }
        />
    );
}