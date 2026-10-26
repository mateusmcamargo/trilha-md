import { Globe } from 'lucide-react';

import { ContactLinks } from './ContactLinks';
import { projectContacts } from './contacts';

import styles from './Settings.module.scss';

export function AboutProject() {
    return (
        <>
            <section className={styles.section}>
                <h2>O que é o Meninas Digitais</h2>
                <p>
                    O <strong>Meninas Digitais UTFPR-CP</strong> é um projeto de extensão da Universidade
                    Tecnológica Federal do Paraná, câmpus Cornélio Procópio. Ele faz parte do Programa
                    Meninas Digitais, da Sociedade Brasileira de Computação.
                </p>
                <p>
                    O objetivo é mostrar para meninas que a tecnologia também é lugar delas: com encontros,
                    oficinas e mentorias, cada uma aprende no seu ritmo e com apoio.
                </p>
            </section>

            <section className={styles.section}>
                <h2>Como funciona a mentoria</h2>
                <p>
                    Cada mentorada segue uma trilha com minigames e encontros presenciais. Uma mentora
                    acompanha o seu caminho, tira dúvidas e ajuda quando algo fica difícil.
                </p>
            </section>

            <section className={styles.section}>
                <h2>Siga o projeto</h2>
                <ContactLinks contacts={[
                    ...projectContacts,
                    {
                        href: 'https://meninas.sbc.org.br/',
                        label: 'Programa Meninas Digitais',
                        detail: 'meninas.sbc.org.br',
                        icon: Globe,
                    },
                ]}/>
            </section>
        </>
    );
}
