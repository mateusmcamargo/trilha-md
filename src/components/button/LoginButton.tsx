'use client'

import styles from './LoginButton.module.scss'
import PressableBase from '../PressableBase/PressableBase'

interface SubmitButtonProps {
    loading: boolean;
}

export function LoginButton({loading}: SubmitButtonProps) {

    return (
        <PressableBase
            color='var(--color-brand-darker)'
            radius='1rem'
        >
            <button className={styles.loginButton} aria-label='Entrar na sua conta' type='submit' disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
            </button>
        </PressableBase>
    )
}