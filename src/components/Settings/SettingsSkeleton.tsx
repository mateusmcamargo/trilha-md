import Skeleton from '#/components/Skeleton/Skeleton';

import styles from './Settings.module.scss';

export interface SkeletonSection {
    // static text, so it shows for real
    title: string;
    // switch: one line per option; card: one box per item; toggle: the theme selector
    kind: 'switch' | 'card' | 'toggle';
    rows?: number;
}

// same layout as the settings sections, while the data loads
export default function SettingsSkeleton({ sections }: { sections: SkeletonSection[] }) {
    return sections.map(({ title, kind, rows = 1 }) => (
        <section key={title} className={styles.section} aria-hidden='true'>
            <h2>{title}</h2>

            <div className={kind === 'switch' ? styles.options : styles.cards}>
                {Array.from({ length: rows }, (_, index) => {
                    if (kind === 'switch') return <Skeleton key={index} width='24rem' height='3rem' radius='1rem'/>;
                    if (kind === 'toggle') return <Skeleton key={index} height='4.8rem' radius='1rem'/>;
                    return <Skeleton key={index} height='16rem' radius='1rem'/>;
                })}
            </div>
        </section>
    ));
}
