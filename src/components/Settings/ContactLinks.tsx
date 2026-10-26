import { ExternalLink } from 'lucide-react';

import type { Contact } from './contacts';

import styles from './Settings.module.scss';

export function ContactLinks({ contacts }: { contacts: Contact[] }) {
    return (
        <ul className={styles.links}>
            {contacts.map(({ href, label, detail, icon: Icon }) => {
                const external = href.startsWith('http');

                return (
                    <li key={href}>
                        <a
                            href={href}
                            className={styles.link}
                            {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
                        >
                            <Icon aria-hidden='true'/>
                            <span className={styles.text}>
                                {label}
                                <small>{detail}</small>
                            </span>
                            {external && (
                                <>
                                    <ExternalLink aria-hidden='true'/>
                                    <span className='sr-only'>(abre em outra aba)</span>
                                </>
                            )}
                        </a>
                    </li>
                );
            })}
        </ul>
    );
}
