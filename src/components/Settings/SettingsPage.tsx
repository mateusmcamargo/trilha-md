import type { ReactNode } from 'react';

import { ArrowLeft } from 'lucide-react';

import PageHeader from '#/components/Header/PageHeader';

interface SettingsPageProps {
    title: string;
    // the settings menu of the current area
    backHref: string;
    // loading.tsx: announces the wait to screen readers
    loading?: boolean;
    children: ReactNode;
}

// header with "Voltar" + main of a settings subpage
export function SettingsPage({ title, backHref, loading, children }: SettingsPageProps) {
    return (
        <>
            <PageHeader
                title={title}
                action={{ href: backHref, label: 'Voltar', icon: ArrowLeft }}
            />

            <main className='main-subpage' aria-label={title} aria-busy={loading || undefined}>
                {loading && <p role='status' className='sr-only'>Carregando...</p>}
                {children}
            </main>
        </>
    );
}
