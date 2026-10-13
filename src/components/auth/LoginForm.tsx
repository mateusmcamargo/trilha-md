'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import styles from './LoginForm.module.scss'
import { Input } from '../forms/Input'
import { Key, Mail } from 'lucide-react'

export function LoginForm() {
    const router = useRouter()
    const supabase = createClient()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)
        setLoading(true)

        const { data, error } = await supabase.auth.signInWithPassword({ email, password })

        if (error || !data.user) {
            setLoading(false)
            setError('E-mail ou senha inválidos.')
            return
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single()

        setLoading(false)
        router.push(profile?.role === 'mentor' ? '/mentor' : '/panel')
        router.refresh()
    }

    return (
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <h1 className={styles.title}>Entrar</h1>

            <Input
                label='E-mail'
                icon={Mail}
                type='email'
                autoComplete='email'
                placeholder='seuemail@dominio.com'
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <Input
                label='Senha'
                icon={Key}
                type='password'
                placeholder='●●●●●●'
                autoComplete='current-password'
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
                <p className={styles.error} role='alert'>
                    {error}
                </p>
            )}

            <button type='submit' disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
            </button>
        </form>
    )
}