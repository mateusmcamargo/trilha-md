import { Flame, Flower, Heart, Sparkles } from 'lucide-react';

import { Badge } from '#/components/Badge/Badge';

import { getPanelData } from '#/utils/panelData';

import styles from './StatsHeader.module.scss';

export default async function StatsHeader() {
    const { stats, trailProgress } = await getPanelData();

    return (
        <header className={styles.header}>
            <div className={styles.trailInfo}>
                <Badge
                    icon={Flower}
                    variant='trail'
                    label={`${trailProgress.toString()} %`}
                />
            </div>

            <div className={styles.progressInfo}>
                <Badge
                    icon={Sparkles}
                    variant='xp'
                    label={stats.xp.toString()}
                />
                <Badge
                    icon={Flame}
                    variant='streak'
                    label={stats.streak.toString()}
                />
                <Badge
                    icon={Heart}
                    variant='life'
                    label={stats.life.toString()}
                />
            </div>
        </header>
    );
}