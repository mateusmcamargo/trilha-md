import type { Metadata } from 'next';

import { ContactLinks } from '#/components/Settings/ContactLinks';
import { developerContacts } from '#/components/Settings/contacts';
import { SettingsPage } from '#/components/Settings/SettingsPage';

import styles from '#/components/Settings/Settings.module.scss';

export const metadata: Metadata = {
    title: 'Contactar o desenvolvedor',
};

export default function ContactDeveloperPage() {
    return (
        <SettingsPage title='Contactar o desenvolvedor' backHref='/settings'>
            <section className={styles.section}>
                <p>Achou um erro no app ou tem uma ideia para melhorar? Conte para o desenvolvedor.</p>
                <ContactLinks contacts={developerContacts}/>
            </section>
        </SettingsPage>
    );
}
