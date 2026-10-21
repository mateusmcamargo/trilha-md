'use client';

import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';

import { X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import styles from './Modal.module.scss';

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    icon: LucideIcon;
    description?: string;
    children?: ReactNode;
    actions?: ReactNode;
    dismissible?: boolean;
}

export function Modal({
    open,
    onClose,
    title,
    icon: Icon,
    description,
    children,
    actions,
    dismissible = true,
}: ModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    const titleId = useId();
    const descriptionId = useId();

    useEffect(() => {
        const dialog = dialogRef.current;

        if (!dialog) return;

        if (open && !dialog.open) {
            dialog.showModal();
            dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus();
        }

        if (!open && dialog.open) dialog.close();
    }, [open]);

    useEffect(() => {
        if (!open) return;

        const overflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = overflow;
        };
    }, [open]);

    return (
        <dialog
            ref={dialogRef}
            className={styles.modal}
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            onClose={onClose}
            onCancel={(e) => {
                if (!dismissible) e.preventDefault();
            }}
            onClick={(e) => {
                if (dismissible && e.target === e.currentTarget) e.currentTarget.close();
            }}
        >
            <div className={styles.content}>
                <header className={styles.header}>
                    <div className={styles.title}>
                        <Icon className={styles.icon} aria-hidden='true'/>
                        <h2 id={titleId}>{title}</h2>
                    </div>

                    {dismissible && (
                        <button
                            type='button'
                            className={styles.close}
                            aria-label='Fechar'
                            onClick={() => dialogRef.current?.close()}
                        >
                            <X aria-hidden='true'/>
                        </button>
                    )}
                </header>

                {description && (
                    <p id={descriptionId} className={styles.description}>
                        {description}
                    </p>
                )}

                {children}

                {actions && (
                    <div className={styles.actions}>
                        {actions}
                    </div>
                )}
            </div>
        </dialog>
    );
}