import type { Metadata } from 'next';

import { ContactLinks } from '#/components/Settings/ContactLinks';
import { projectContacts } from '#/components/Settings/contacts';
import { SettingsPage } from '#/components/Settings/SettingsPage';

import styles from '#/components/Settings/Settings.module.scss';

export const metadata: Metadata = {
    title: 'Contactar o projeto',
};

export default function ContactProjectPage() {
    return (
        <SettingsPage title='Contactar o projeto' backHref='/settings'>
            <section className={styles.section}>
                <p>Fale com a equipe do Meninas Digitais UTFPR-CP sobre encontros, inscrições e parcerias.</p>
                <ContactLinks contacts={projectContacts}/>
            </section>
        </SettingsPage>
    );
}
