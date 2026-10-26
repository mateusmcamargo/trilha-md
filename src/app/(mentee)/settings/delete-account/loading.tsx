import { ArrowLeft, EyeOff, LogOut, TrendingDown, UserX } from 'lucide-react';

import DeleteAccountFormSkeleton from '#/components/DeleteAccountForm/DeleteAccountFormSkeleton';
import PageHeader from '#/components/Header/PageHeader';

import styles from './page.module.scss';

// shown at once on navigation, while getMenteeData loads; the warning is static, only the form waits
export default function DeleteAccountLoading() {
    return (
        <>
            <PageHeader
                title='Deletar conta'
                action={{ href: '/settings/profile', label: 'Voltar', icon: ArrowLeft }}
            />

            <main
                className={`main-subpage ${styles.deleteAccount}`}
                aria-label='Deletar conta'
                aria-busy='true'
            >
                <p role='status' className='sr-only'>Carregando...</p>

                <section className={styles.info}>
                    <h2>O que acontece ao deletar</h2>

                    <ul>
                        <li>
                            <LogOut aria-hidden='true'/>
                            Sua conta é desativada e você sai do app agora.
                        </li>
                        <li>
                            <EyeOff aria-hidden='true'/>
                            Seu perfil deixa de aparecer para as outras pessoas.
                        </li>
                        <li>
                            <TrendingDown aria-hidden='true'/>
                            Você perde acesso à sua trilha, ao seu XP e aos seus certificados.
                        </li>
                        <li>
                            <UserX aria-hidden='true'/>
                            Você não poderá entrar de novo com esta conta.
                        </li>
                    </ul>

                    <p>
                        Esta ação não pode ser desfeita por você. Se mudar de ideia, fale com a sua mentora.
                    </p>
                </section>

                <DeleteAccountFormSkeleton/>
            </main>
        </>
    );
}
