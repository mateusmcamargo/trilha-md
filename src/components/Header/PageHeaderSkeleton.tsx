import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

import Skeleton from '#/components/Skeleton/Skeleton';

import styles from './PageHeader.module.scss';

interface PageHeaderSkeletonProps {
    // a static title shows for real; without it the title is a skeleton
    title?: string;
    // without it (link depends on the url, which loading.tsx can't read) the button is a skeleton
    action?: {
        href: string;
        label: string;
        icon: LucideIcon;
    };
}

// same layout as PageHeader, for pages whose title or back link come from the data
export default function PageHeaderSkeleton({ title, action }: PageHeaderSkeletonProps) {
    return (
        <header className={styles.header}>
            {title ? <h1>{title}</h1> : <Skeleton width='16rem' height='2.8rem'/>}

            {action ? (
                <Link href={action.href} className={styles.action} aria-label={action.label}>
                    <action.icon aria-hidden='true'/>
                </Link>
            ) : (
                <Skeleton width='3.6rem' height='3.6rem'/>
            )}
        </header>
    );
}
