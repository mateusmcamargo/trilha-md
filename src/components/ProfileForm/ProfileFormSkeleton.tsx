import InputSkeleton from '#/components/Input/InputSkeleton';
import Skeleton from '#/components/Skeleton/Skeleton';

import styles from './ProfileForm.module.scss';

// same layout as ProfileForm: personal data, verification, password and save button
export default function ProfileFormSkeleton() {
    return (
        <form className={styles.form} aria-hidden='true'>
            <fieldset className={styles.group}>
                <legend>Seus dados</legend>
                <InputSkeleton label='Nome'/>
                <InputSkeleton label='Nome de usuário'/>
                <InputSkeleton label='E-mail'/>
            </fieldset>

            <div className={styles.verified}>
                <Skeleton width='16rem' height='1.6rem'/>
            </div>

            <fieldset className={styles.group}>
                <legend>Alterar senha</legend>
                <p className={styles.hint}>Deixe os campos em branco para manter a sua senha atual.</p>
                <InputSkeleton label='Senha'/>
                <InputSkeleton label='Confirmar senha'/>
            </fieldset>

            <Skeleton height='4.4rem' radius='1rem'/>
        </form>
    );
}
