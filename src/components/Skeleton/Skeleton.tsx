import type { CSSProperties } from 'react';
import styles from './Skeleton.module.scss';

interface SkeletonProps {
    width?: string;
    height?: string;
    radius?: string;
    label?: string;
    className?: string;
}

export default function Skeleton({
    width = '100%',
    height = '1.6rem',
    radius = '.8rem',
    label,
    className,
}: SkeletonProps) {
    const style = {
        '--skeleton-width': width,
        '--skeleton-height': height,
        '--skeleton-radius': radius,
    } as CSSProperties;

    return (
        <div
            className={[styles.skeleton, className].filter(Boolean).join(' ')}
            style={style}
            role={label ? 'status' : undefined}
            aria-hidden={label ? undefined : 'true'}
        >
            {label && <span className={styles.srOnly}>{label}</span>}
        </div>
    );
}