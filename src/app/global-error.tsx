'use client';

import './styles/globals.css';

import ErrorPage from './error';

// replaces the root layout: needs its own <html> and <body>
export default function GlobalError({ error, retry }: {
    error: Error & { digest?: string };
    retry: () => void;
}) {
    return (
        <html lang='pt-BR'>
            <body>
                <ErrorPage error={error} retry={retry}/>
            </body>
        </html>
    );
}
