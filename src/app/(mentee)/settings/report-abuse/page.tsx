import type { Metadata } from 'next';

import { ReportAbuseForm } from '#/components/Settings/ReportAbuseForm';
import { SettingsPage } from '#/components/Settings/SettingsPage';

import styles from '#/components/Settings/Settings.module.scss';

export const metadata: Metadata = {
    title: 'Reportar abuso',
};

export default function ReportAbusePage() {
    return (
        <SettingsPage title='Reportar abuso' backHref='/settings'>
            <section className={styles.section}>
                <p>
                    Alguém te desrespeitou, mandou algo que te deixou desconfortável ou fingiu ser outra
                    pessoa? Conte para nós. A pessoa denunciada não fica sabendo quem denunciou.
                </p>
            </section>

            <ReportAbuseForm backHref='/settings'/>
        </SettingsPage>
    );
}
