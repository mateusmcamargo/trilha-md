import type { Metadata } from 'next';
import Link from 'next/link';

import { PreferenceSwitches } from '#/components/Settings/PreferenceSwitches';
import { SettingsPage } from '#/components/Settings/SettingsPage';
import { privacyGroups } from '#/components/Settings/switchGroups';

import { getPreferences } from '#/utils/preferences';
import { isSkeletonPreview } from '#/utils/skeletonPreview';

import PrivacyLoading from './loading';

import styles from '#/components/Settings/Settings.module.scss';

export const metadata: Metadata = {
    title: 'Privacidade',
};

export default async function PrivacyPage() {
    // demo mode with the data turned off
    if (await isSkeletonPreview()) return <PrivacyLoading/>;

    const preferences = await getPreferences();

    return (
        <SettingsPage title='Privacidade' backHref='/settings'>
            <PreferenceSwitches groups={privacyGroups} preferences={preferences}/>

            <section className={styles.section}>
                <p>
                    Quer saber quem vê cada dado? Leia{' '}
                    <Link href='/settings/privacy-disclaimer' className={styles.inline}>Sobre os seus dados</Link>.
                </p>
            </section>
        </SettingsPage>
    );
}
