import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import styles from './PageHeader.module.scss';

interface PageHeaderProps {
    title: string;
    action: {
        href: string;
        label: string;
        icon: LucideIcon;
    };
}

export default function PageHeader({ title, action }: PageHeaderProps) {
    const { href, label, icon: Icon } = action;

    return (
        <header className={styles.header}>
            <h1>{title}</h1>

            <Link href={href} className={styles.action} aria-label={label}>
                <Icon aria-hidden='true' />
            </Link>
        </header>
    );
}