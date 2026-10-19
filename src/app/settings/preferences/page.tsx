import type { Metadata } from 'next';

import { ArrowLeft } from 'lucide-react';

import PageHeader from '#/components/Header/PageHeader';
import Toggle from '#/components/Toggle/Toggle';
import Switch from '#/components/Switch/Switch';

import styles from './page.module.scss';

export const metadata: Metadata = {
    title: 'Preferências',
};

export default function PreferencesPage() {
    return (
        <>
            <PageHeader
                title='Preferências'
                action={{ href: '/settings', label: 'Voltar', icon: ArrowLeft }}
            />

            <main
                className={`main-subpage ${styles.preferences}`}
                aria-label='Preferências'
            >
                <section className={styles.section}>
                    <h2>Sua Trilha</h2>

                    <div className={styles.options}>
                        <Switch name='sounds'        label='Efeitos Sonoros' defaultChecked/>
                        <Switch name='animations'    label='Animações' defaultChecked/>
                        <Switch name='funnyMessages' label='Mensagens engraçadinhas' defaultChecked/>
                    </div>
                </section>

                <section className={styles.section}>
                    <h2>Aparência</h2>

                    <div className={styles.options}>
                        <Toggle
                            name='theme'
                            label='Tema'
                            options={[
                                { value: 'light', label: 'Claro' },
                                { value: 'dark', label: 'Escuro' },
                            ]}
                            defaultValue='light'
                        />
                    </div>
                </section>
            </main>
        </>
    );
}