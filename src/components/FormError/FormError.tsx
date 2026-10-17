import type { ReactNode } from 'react';

import styles from './FormError.module.scss';
import { CircleX } from 'lucide-react';

interface FormErrorProps {
    id?: string;
    children: ReactNode;
}

export default function FormError({ id, children }: FormErrorProps) {
    return (
        <div id={id} role='alert' className={styles.error}>
            <CircleX/>
            <p>{children}</p>
        </div>
    );
}