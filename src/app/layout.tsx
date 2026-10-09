import './styles/globals.css';

import type { Metadata } from 'next';
import { IBM_Plex_Mono, IBM_Plex_Serif, Nunito } from 'next/font/google';

const ibmPlexMono = IBM_Plex_Mono({
    variable: '--font-ibm-plex-mono',
    weight: ['100', '200', '300', '400', '500' ,'600', '700'],
});

const ibmPlexSerif = IBM_Plex_Serif({
    variable: '--font-ibm-plex-serif',
    weight: ['100', '200', '300', '400', '500' ,'600', '700'],
});

const nunito = Nunito({
    variable: '--font-nunito',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: 'Trilha Meninas Digitais',
    description: 'Trilha gameficada para todas.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
    return (
        <html
            lang='pt-br'
            className={`
                ${nunito.variable}
                ${ibmPlexMono.variable}
                ${ibmPlexSerif.variable}
            `}
        >
            <body>{children}</body>
        </html>
    );
}
