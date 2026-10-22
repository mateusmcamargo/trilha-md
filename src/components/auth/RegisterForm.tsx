'use client'

import { CaseSensitive, Info, Key, Mail, Ticket, User } from 'lucide-react'

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

type Field = 'name' | 'username' | 'email' | 'password' | 'confirmPassword' | 'accessCode';

// same format as the CHECK profiles_username_format in the database
export const USERNAME_FORMAT  = /^[a-z0-9._]{3,30}$/;
export const EMAIL_FORMAT     = /^\S+@\S+\.\S+$/;
export const MIN_PASSWORD     = 8;
export const CONNECTION_ERROR = 'Não foi possível conectar. Tente novamente.';

export function RegisterForm() {
    const router   = useRouter();
    const supabase = getSupabase();
    const errorId  = useId();

    const [name,            setName]            = useState<string>('');
    const [username,        setUsername]        = useState<string>('');
    const [email,           setEmail]           = useState<string>('');
    const [password,        setPassword]        = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [accessCode,      setAccessCode]      = useState<string>('');
    const [error,           setError]           = useState<{ field?: Field, message: string } | null>(null);
    const [loading,         setLoading]         = useState<boolean>(false);

    function fail(field: Field | undefined, message: string) {
        setLoading(false);
        setError({ field, message });
    }

    // marks only the field with error for screen readers
    function invalid(field: Field) {
        return error?.field === field
            ? { 'aria-invalid': true, 'aria-describedby': errorId }
            : {}
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        const fullName = name.trim();
        const cleanUsername = username.trim().toLowerCase();
        const cleanEmail = email.trim();
        const code = accessCode.trim();

        if (!fullName)
            return fail('name', 'Informe seu nome.');
        if (!USERNAME_FORMAT.test(cleanUsername))
            return fail('username', 'Use de 3 a 30 letras minúsculas, números, ponto ou _.');
        if (!EMAIL_FORMAT.test(cleanEmail))
            return fail('email', 'Informe um e-mail válido.');
        if (password.length < MIN_PASSWORD)
            return fail('password', `A senha precisa ter pelo menos ${MIN_PASSWORD} caracteres.`);
        if (password !== confirmPassword)
            return fail('confirmPassword', 'As senhas não coincidem.');
        if (!code)
            return fail('accessCode', 'Informe o código de acesso.');

        if (!supabase) {
            router.push('/trail');
            return;
        }

        setLoading(true);

        const [usernameCheck, codeCheck] = await Promise.all([
            supabase.rpc('is_username_available', { p_username: cleanUsername }),
            supabase.rpc('check_access_code', { p_access_code: code }),
        ]);

        if (usernameCheck.error || codeCheck.error)
            return fail(undefined, CONNECTION_ERROR);
        if (!usernameCheck.data)
            return fail('username', 'Este nome de usuário já está em uso.');
        if (!codeCheck.data)
            return fail('accessCode', 'Código de acesso inválido.');

        const { error: signUpError } = await supabase.auth.signUp({
            email: cleanEmail,
            password,
            options: { data: { full_name: fullName, username: cleanUsername } },
        })

        if (signUpError) {
            if (signUpError.name === 'AuthRetryableFetchError')
                return fail(undefined, CONNECTION_ERROR);
            if (signUpError.code === 'user_already_exists')
                return fail('email', 'Este e-mail já está cadastrado.');
            if (signUpError.code === 'weak_password')
                return fail('password', 'Senha muito fraca. Tente outra.');
            return fail(undefined, 'Não foi possível criar a conta. Tente novamente.');
        }

        await supabase.rpc('join_edition', { p_access_code: code });

        router.push('/trail');
        router.refresh();
    }

    return (
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <FormTitle
                title='Crie sua conta!'
                description='Use o código que sua mentora te passou ;)'
            />

            <Input
                label='Nome'
                icon={CaseSensitive}
                type='text'
                autoComplete='name'
                placeholder='Maria Silva'
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                {...invalid('name')}
            />

            <Input
                label='Nome de usuário'
                icon={User}
                type='text'
                autoComplete='username'
                autoCapitalize='none'
                spellCheck={false}
                placeholder='maria.silva'
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                {...invalid('username')}
            />

            <Input
                label='E-mail'
                icon={Mail}
                type='email'
                autoComplete='email'
                placeholder='seuemail@dominio.com'
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                {...invalid('email')}
            />

            <Input
                label={`Senha (mínimo ${MIN_PASSWORD} caracteres)`}
                icon={Key}
                type='password'
                autoComplete='new-password'
                placeholder='●●●●●●●●'
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                {...invalid('password')}
            />

            <Input
                label='Confirmar senha'
                icon={Key}
                type='password'
                autoComplete='new-password'
                placeholder='●●●●●●●●'
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                {...invalid('confirmPassword')}
            />

            <Input
                label='Código de acesso'
                icon={Ticket}
                type='text'
                autoComplete='off'
                autoCapitalize='none'
                spellCheck={false}
                placeholder='Código da sua mentora'
                required
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                {...invalid('accessCode')}
            />

            {isMockMode && (
                <div className={styles.notice}>
                    <div className={styles.title}>
                        <Info/>
                        <span>Modo demonstração</span>
                    </div>
                    <p>Nada será salvo, os dados são de exemplo. Preencha os campos para continuar.</p>
                </div>
            )}

            {error && <FormError id={errorId}>{error.message}</FormError>}

            <SubmitButton loading={loading} loadingLabel='Criando conta...'>
                Criar conta
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

            <AuthSwitchLink text='Já tem uma conta?' href='/login' label='Entrar'/>
        </form>
    )
}