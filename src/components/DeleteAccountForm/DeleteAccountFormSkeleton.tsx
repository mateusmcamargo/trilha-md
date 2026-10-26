import InputSkeleton from '#/components/Input/InputSkeleton';
import Skeleton from '#/components/Skeleton/Skeleton';

import styles from './DeleteAccountForm.module.scss';

// same layout as DeleteAccountForm: reason, password and the two buttons
export default function DeleteAccountFormSkeleton() {
    return (
        <form className={styles.form} aria-hidden='true'>
            <div className={styles.field}>
                <label>Por que você quer deletar? (opcional)</label>
                <Skeleton height='12rem' radius='1rem'/>
            </div>

            <InputSkeleton label='Sua senha'/>

            <div className={styles.actions}>
                <Skeleton height='4.4rem' radius='1rem'/>
                <Skeleton height='4.4rem' radius='1rem'/>
            </div>
        </form>
    );
}
