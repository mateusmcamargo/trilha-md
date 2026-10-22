'use client'

import { Info, Key, Mail } from 'lucide-react'

import { useId, useState } from 'react'
import { useRouter } from 'next/navigation'

import { getSupabase } from '#/utils/supabase/getSupabase'
import { isMockMode } from '#/utils/mockMode'
import { Input } from '../Input/Input'
import { SubmitButton } from '../Button/SubmitButton'
import FormError from '../FormError/FormError'
import { AuthSwitchLink } from './AuthSwitchLink'

import styles from './LoginForm.module.scss'
import { FormTitle } from '../FormTitle/FormTitle'
import { Button } from '../Button/Button'

export function LoginForm() {
    const router   = useRouter();
    const supabase = getSupabase();
    const errorId  = useId();

    const [email,    setEmail]    = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error,    setError]    = useState<string | null>(null);
    const [loading,  setLoading]  = useState<boolean>(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (!supabase) {
            router.push('/trail');
            return;
        }

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error?.name === 'AuthRetryableFetchError') {
            setLoading(false);
            setError('Não foi possível conectar. Tente novamente.');
            return;
        }

        if (error || !data.user) {
            setLoading(false);
            setError('E-mail ou senha inválidos.');
            return;
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();

        // ?next= comes from the proxy; only paths inside the app
        const next = new URLSearchParams(window.location.search).get('next');
        const safeNext = next && /^\/(?![/\\])/.test(next) ? next : null;

        router.push(safeNext ?? (profile?.role === 'mentor' ? '/team' : '/trail'));
        router.refresh();
    }

    return (
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <FormTitle
                title='Bem vinda de volta!'
                description='Faça login para voltar à sua trilha ;)'
            />

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
                    <p>Nada será salvo, os dados são de exemplo. Use qualquer e-mail e senha.</p>
                </div>
            )}

            {error && <FormError id={errorId}>{error}</FormError>}

            <SubmitButton loading={loading} loadingLabel='Entrando...'>
                Entrar
            </SubmitButton>

            {isMockMode && (
                <Button
                    fullWidth
                    disabled={loading}
                    onClick={() => router.push('/team')}
                >
                    Entrar como mentora
                </Button>
            )}

            <AuthSwitchLink text='Ainda não tem conta?' href='/register' label='Criar conta'/>
        </form>
    )
}