import type { CSSProperties, ReactNode } from 'react';
import styles from './PressableBase.module.scss';

interface PressableBaseProps {
    children: ReactNode;
    color: string;
    depth?: number;
    radius?: string;
    className?: string;
}

export default function PressableBase({
    children,
    color,
    depth = 8,
    radius = '1rem',
    className,
}: PressableBaseProps) {
    const style = {
        '--base-color': color,
        '--depth': `${depth}px`,
        '--radius': radius,
    } as CSSProperties;

    return (
        <div
            className={[styles.wrapper, className].filter(Boolean).join(' ')}
            style={style}
        >
            <span className={styles.base} aria-hidden='true' />
            {children}
        </div>
    );
}