import type { Metadata } from 'next'

import { RegisterForm } from '#/components/auth/RegisterForm'

import styles from './page.module.scss'

export const metadata: Metadata = {
    title: 'Criar conta',
}

export default function RegisterPage() {
    return (
        <main className={styles.register}>
            <RegisterForm/>
        </main>
    )
}