'use client'

import { useId, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '#/utils/supabase/getSupabase'
import { isMockMode } from '#/utils/mockMode'
import styles from './LoginForm.module.scss'
import { Input } from '../Input/Input'
import { Info, Key, Mail } from 'lucide-react'
import { SubmitButton } from '../Button/SubmitButton'
import FormError from '../FormError/FormError'

export function LoginForm() {
    const router   = useRouter()
    const supabase = getSupabase()
    const errorId  = useId()

    const [email,    setEmail]    = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [error,    setError]    = useState<string | null>(null)
    const [loading,  setLoading]  = useState<boolean>(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)
        setLoading(true)

        if (!supabase) {
            router.push('/panel')
            return
        }

        const { data, error } = await supabase.auth.signInWithPassword({ email, password })

        if (error?.name === 'AuthRetryableFetchError') {
            setLoading(false)
            setError('Não foi possível conectar. Tente novamente.')
            return
        }

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

        router.push(profile?.role === 'mentor' ? '/mentor' : '/panel')
        router.refresh()
    }

    return (
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.title}>
                <h1>Bem vinda de volta!</h1>
                <p>Faça login para voltar à sua trilha ;)</p>
            </div>

            <Input
                label='E-mail'
                icon={Mail}
                type='email'
                autoComplete='email'
                placeholder='seuemail@dominio.com'
                required
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? errorId : undefined}
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
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? errorId : undefined}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            {isMockMode && (
                <div className={styles.notice}>
                    <div className={styles.title}>
                        <Info/>
                        <span>Modo demonstração</span>
                    </div>
                    <p>Use qualquer e-mail e senha. Os dados são de exemplo.</p>
                </div>
            )}

            {error && <FormError id={errorId}>{error}</FormError>}

            <SubmitButton loading={loading} loadingLabel='Entrando...'>
                Entrar
            </SubmitButton>
        </form>
    )
}