import Link from 'next/link';

import { ChevronRight, type LucideIcon } from 'lucide-react';

import styles from './Settings.module.scss';

export interface SettingsSection {
    title: string;
    links: { slug: string; label: string; icon: LucideIcon }[];
}

interface SettingsMenuProps {
    sections: SettingsSection[];
    // '/settings' or '/team/settings'
    basePath: string;
}

export function SettingsMenu({ sections, basePath }: SettingsMenuProps) {
    return sections.map(({ title, links }) => (
        <section key={title} className={styles.section}>
            <h2>{title}</h2>

            <ul className={styles.links}>
                {links.map(({ slug, label, icon: Icon }) => (
                    <li key={slug}>
                        <Link href={`${basePath}/${slug}`} className={styles.link}>
                            <Icon aria-hidden='true'/>
                            <span className={styles.text}>{label}</span>
                            <ChevronRight aria-hidden='true'/>
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    ));
}
