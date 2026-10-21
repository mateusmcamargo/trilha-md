import styles         from './Badge.module.scss';
import { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type BadgeData = {
    label?: ReactNode;
    className: string;
    icon?: LucideIcon;
    isActive?: boolean;
    description?: string;
}

type BadgeProps = {
    data?: BadgeData;
    label?: ReactNode;
    variant?: string;
    icon?: LucideIcon;
    isActive?: boolean;
    description?: string;

    action?: {
        icon: LucideIcon;
        label: string;
        onClick: () => void;
    };
};

export function Badge({
    data,
    label,
    variant,
    isActive,
    description,
    icon: CustomIcon,
    action,
}: BadgeProps) {

    const finalLabel       = data?.label       ?? label       ?? '';
    const finalVariant     = data?.className   ?? variant     ?? '';
    const finalActive      = data?.isActive    ?? isActive    ?? false;
    const finalDescription = data?.description ?? description;
    const Icon             = data?.icon        ?? CustomIcon;

    const classes = [
        styles.badge,
        finalVariant && styles[finalVariant],
        finalActive && styles.active,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <span
            className={classes}
            aria-current={finalActive ? 'true' : undefined}
        >
            {Icon && <Icon strokeWidth={2} aria-hidden='true' focusable='false' />}
            {finalLabel}

            {finalDescription && (
                <span className={styles.srOnly}>{finalDescription}</span>
            )}

            {action && (
                <button
                    type='button'
                    className={styles.rightAction}
                    onClick={action.onClick}
                    aria-label={action.label}
                >
                    <action.icon aria-hidden='true' focusable='false' />
                </button>
            )}
        </span>
    );
}