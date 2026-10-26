import Link from 'next/link';

import styles from './Settings.module.scss';

interface DataDisclaimerProps {
    // mentee: talks to her, with links to her privacy and profile pages
    // mentor: explains what is kept about the mentees
    area: 'mentee' | 'mentor';
}

export function DataDisclaimer({ area }: DataDisclaimerProps) {
    const mentee = area === 'mentee';

    return (
        <>
            <section className={styles.section}>
                <h2>Quais dados guardamos</h2>
                <p>
                    <strong>Conta:</strong> nome, nome de usuário, e-mail e senha. A senha é guardada de forma
                    protegida: ninguém consegue ver, nem as mentoras nem o desenvolvedor.
                </p>
                <p>
                    <strong>Trilha:</strong> as respostas dos minigames, o XP, a ofensiva, as presenças nos
                    encontros, as reflexões e os certificados.
                </p>
                <p>
                    <strong>Preferências:</strong> tema, sons, animações, notificações e privacidade.
                </p>
            </section>

            <section className={styles.section}>
                <h2>Quem vê o quê</h2>
                <p>
                    <strong>Todas as mentoras</strong> veem a lista de mentoradas: nome, trilha, mentora, XP
                    e ofensiva.
                </p>
                <p>
                    <strong>Só a mentora responsável</strong> vê os detalhes: presenças, respostas, reflexões
                    e certificados.
                </p>
                <p>
                    <strong>As amigas</strong> veem o nome, o nome de usuário e o XP total.
                    {mentee && (
                        <>
                            {' '}Você pode esconder o seu XP e sair da busca em{' '}
                            <Link href='/settings/privacy' className={styles.inline}>Privacidade</Link>.
                        </>
                    )}
                </p>
                <p>
                    <strong>As denúncias de abuso</strong> são lidas só pelas mentoras.
                </p>
            </section>

            <section className={styles.section}>
                <h2>{mentee ? 'Seus direitos' : 'Direitos das mentoradas'}</h2>
                <p>
                    Os dados são usados só para o projeto e nunca são vendidos. Eles ficam guardados no
                    Supabase, um serviço de banco de dados na nuvem.
                </p>
                {mentee ? (
                    <>
                        <p>
                            Em <Link href='/settings/profile' className={styles.inline}>Perfil</Link>, você pode
                            baixar uma cópia dos seus dados ou deletar a sua conta.
                        </p>
                        <p>
                            Se você tem menos de 18 anos, conte para a sua família sobre o app. Qualquer dúvida,
                            fale com a sua mentora ou com o projeto.
                        </p>
                    </>
                ) : (
                    <p>
                        Cada mentorada pode baixar uma cópia dos próprios dados ou deletar a conta no perfil dela.
                    </p>
                )}
            </section>
        </>
    );
}
