import Link from 'next/link';

import PressableBase from '#/components/PressableBase/PressableBase';

import styles from './not-found.module.scss';

export default function NotFound() {
    return (
        <main className={styles.notFound}>
            <div className={styles.message}>
                <h1>Ops! Não tem nada aqui!</h1>
                <p>Acho que esqueceram de<br/>programar essa parte... <span aria-hidden='true'>😳</span></p>
            </div>

            <PressableBase color='var(--color-brand-darker)' radius='1rem'>
                <Link href='/panel/trail' className={styles.button}>
                    Voltar para a sua trilha
                </Link>
            </PressableBase>
        </main>
    );
}