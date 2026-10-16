import type { Metadata } from 'next';
import Link from 'next/link';

import { ArrowLeft, ChevronRight } from 'lucide-react';

import { LogoutButton } from '#/components/Button/LogoutButton';
import PageHeader from '#/components/Header/PageHeader';

import { settingsSections } from './links';

import styles from './page.module.scss';

export const metadata: Metadata = {
    title: 'Configurações',
};

export default function SettingsPage() {
    return (
        <>
            <PageHeader
                title='Configurações'
                action={{ href: '/panel/profile', label: 'Voltar', icon: ArrowLeft }}
            />

            <main
                className={styles.settings}
                aria-label='Configurações'
            >
                {settingsSections.map(({ title, links }) => (
                    <section key={title} className={styles.section}>
                        <h2>{title}</h2>

                        <ul>
                            {links.map(({ slug, label, icon: Icon }) => (
                                <li key={slug}>
                                    <Link
                                        href={`/panel/settings/${slug}`}
                                        className={styles.link}
                                    >
                                        <Icon aria-hidden='true'/>
                                        <span>{label}</span>
                                        <ChevronRight aria-hidden='true'/>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </section>
                ))}

                <section className={styles.logout}>
                    <LogoutButton/>
                </section>
            </main>
        </>
    );
}