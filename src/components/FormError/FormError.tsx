import type { ReactNode } from 'react';

import styles from './FormError.module.scss';

interface FormErrorProps {
    id?: string;
    children: ReactNode;
}

export default function FormError({ id, children }: FormErrorProps) {
    return (
        <p id={id} className={styles.error} role='alert'>
            {children}
        </p>
    );
}