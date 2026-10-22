import type { Metadata } from 'next';

import { ArrowLeft, EyeOff, LogOut, TrendingDown, UserX } from 'lucide-react';

import { DeleteAccountForm } from '#/components/DeleteAccountForm/DeleteAccountForm';
import PageHeader from '#/components/Header/PageHeader';

import { getMenteeData } from '#/utils/menteeData';

import styles from './page.module.scss';

export const metadata: Metadata = {
    title: 'Deletar conta',
};

export default async function DeleteAccountPage() {
    const { user } = await getMenteeData();

    return (
        <>
            <PageHeader
                title='Deletar conta'
                action={{ href: '/settings/profile', label: 'Voltar', icon: ArrowLeft }}
            />

            <main
                className={`main-subpage ${styles.deleteAccount}`}
                aria-label='Deletar conta'
            >
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

                <DeleteAccountForm email={user.email}/>
            </main>
        </>
    );
}
