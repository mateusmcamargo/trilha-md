import { Flame, Flower, Heart, Sparkles } from 'lucide-react';

import { Badge } from '#/components/Badge/Badge';

import styles from './StatsHeader.module.scss';

interface StatsHeaderProps {
    progress: number;
    xp: number;
    streak: number;
    life: number;
}

export default function StatsHeader({ progress, xp, streak, life }: StatsHeaderProps) {
    return (
        <header className={styles.header}>
            <div className={styles.trailInfo}>
                <Badge
                    icon={Flower}
                    variant='trail'
                    label={`${progress.toString()} %`}
                />
            </div>

            <div className={styles.progressInfo}>
                <Badge
                    icon={Sparkles}
                    variant='xp'
                    label={xp.toString()}
                />
                <Badge
                    icon={Flame}
                    variant='streak'
                    label={streak.toString()}
                />
                <Badge
                    icon={Heart}
                    variant='life'
                    label={life.toString()}
                />
            </div>
        </header>
    );
}