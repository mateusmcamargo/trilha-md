import type { ReactNode } from 'react';

import type { LucideIcon } from 'lucide-react';

import { Button } from './Button';

interface SubmitButtonProps {
    children: ReactNode;
    loading?: boolean;
    loadingLabel?: string;
    icon?: LucideIcon;
}

export function SubmitButton({ children, loading = false, loadingLabel, icon }: SubmitButtonProps) {
    return (
        <Button
            variant='brand'
            type='submit'
            icon={icon}
            fullWidth
            disabled={loading}
            aria-busy={loading}
        >
            {loading && loadingLabel ? loadingLabel : children}
        </Button>
    );
}
