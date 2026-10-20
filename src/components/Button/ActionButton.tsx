import type { ButtonHTMLAttributes } from 'react';

import type { LucideIcon } from 'lucide-react';

import styles from './ActionButton.module.scss';
import PressableBase from '../PressableBase/PressableBase';

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'neutral' | 'danger' | 'brand';
    icon?: LucideIcon;
}

const colors = {
    neutral: 'var(--color-button-border)',
    danger: 'var(--color-danger-darker)',
    brand: 'var(--color-brand-darker)',
};

export function ActionButton({ variant = 'neutral', icon: Icon, children, ...props }: ActionButtonProps) {
    return (
        <PressableBase
            color={colors[variant]}
            radius='1rem'
        >
            <button
                type='button'
                className={`${styles.actionButton} ${styles[variant]}`}
                {...props}
            >
                {Icon && <Icon aria-hidden='true'/>}
                {children}
            </button>
        </PressableBase>
    );
}