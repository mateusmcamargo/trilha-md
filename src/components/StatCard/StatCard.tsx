import type { LucideIcon } from 'lucide-react';

import styles from './StatCard.module.scss';

type StatTone = 'xp' | 'streak' | 'gold' | 'danger';

interface StatCardProps {
    icon: LucideIcon;
    label: string;
    value: string | number;
    hint?: string;
    // square block (icon, value and label stacked); default is the horizontal card
    square?: boolean;
    // color of the icon; without it the icon is brand
    tone?: StatTone;
}

export default function StatCard({ icon: Icon, label, value, hint, square, tone }: StatCardProps) {
    const className = [
        styles.card,
        square && styles.square,
        tone && styles[tone],
    ].filter(Boolean).join(' ');

    return (
        <div className={className}>
            <Icon aria-hidden='true'/>

            <dl>
                <dt>{label}</dt>
                <dd>{value}</dd>
            </dl>

            {hint && <p>{hint}</p>}
        </div>
    );
}
