import type { ReactNode } from 'react';

import type { LucideIcon } from 'lucide-react';

import styles from './SubmitButton.module.scss';
import PressableBase from '../PressableBase/PressableBase';

interface SubmitButtonProps {
    children: ReactNode;
    loading?: boolean;
    loadingLabel?: string;
    icon?: LucideIcon;
}

export function SubmitButton({ children, loading = false, loadingLabel, icon: Icon }: SubmitButtonProps) {
    return (
        <PressableBase
            color='var(--color-brand-darker)'
            radius='1rem'
        >
            <button
                type='submit'
                className={styles.submitButton}
                disabled={loading}
                aria-busy={loading}
            >
                {Icon && <Icon aria-hidden='true'/>}
                {loading && loadingLabel ? loadingLabel : children}
            </button>
        </PressableBase>
    );
}