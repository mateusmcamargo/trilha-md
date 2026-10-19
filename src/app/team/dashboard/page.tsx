import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Painel',
};

export default function DashboardPage() {
    return (
        <main className='main-tabs' aria-label='Painel da tutora'>
            <h2>Painel da tutora</h2>
        </main>
    );
}