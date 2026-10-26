import Link from 'next/link';

import packageJson from '../../../package.json';

import styles from './Settings.module.scss';

// contactHref: the developer contact page of the current area
export function AboutApp({ contactHref }: { contactHref: string }) {
    return (
        <>
            <section className={styles.section}>
                <h2>Áster</h2>
                <p>
                    O Áster é o aplicativo de aprendizado do Meninas Digitais UTFPR-CP. Aqui você segue a
                    sua trilha, joga minigames de programação, confirma presença nos encontros pelo
                    QR Code e acompanha o seu XP e a sua ofensiva.
                </p>
                <p>
                    Versão <strong>{packageJson.version}</strong>
                </p>
            </section>

            <section className={styles.section}>
                <h2>Quem fez</h2>
                <p>
                    O app foi criado na disciplina de Certificadora da Competência 3, da UTFPR, em parceria
                    com o projeto. O código é aberto e está no GitHub.
                </p>
                <p>
                    Encontrou um problema ou tem uma ideia?{' '}
                    <Link href={contactHref} className={styles.inline}>Fale com o desenvolvedor</Link>.
                </p>
            </section>

            <section className={styles.section}>
                <h2>Acessibilidade</h2>
                <p>
                    O app respeita o tamanho de letra do seu celular, funciona com leitor de tela e tem
                    tema escuro e opção de desligar as animações em Preferências.
                </p>
            </section>
        </>
    );
}
