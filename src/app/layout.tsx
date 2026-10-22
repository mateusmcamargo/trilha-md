import './styles/globals.css';

import type { Metadata } from 'next';
import { Chakra_Petch, IBM_Plex_Serif, JetBrains_Mono, Nunito } from 'next/font/google';

const jetbrainsMono = JetBrains_Mono({
    variable: '--font-jetbrains-mono',
    subsets: ['latin'],
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

const chakraPetch = Chakra_Petch({
    variable: '--font-chakra-petch',
    subsets:['latin'],
    weight: ['300', '400', '500' ,'600', '700'],
});

export const metadata: Metadata = {
    title: {
        default: 'Áster',
        template: '%s | Áster',
    },
    description: 'Tecnologia gameficada para todas.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
    return (
        <html
            lang='pt-BR'
            className={`
                ${nunito.variable}
                ${jetbrainsMono.variable}
                ${ibmPlexSerif.variable}
                ${chakraPetch.variable}
            `}
        >
            <body>{children}</body>
        </html>
    );
}
