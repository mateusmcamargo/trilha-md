'use client';

import { useId, useState } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';

import { CaseSensitive, Check, Key, Mail, User, X } from 'lucide-react';

import { getSupabase } from '#/utils/supabase/getSupabase';
import { Input } from '../Input/Input';
import { SaveButton } from '../Button/SaveButton';
import FormError from '../FormError/FormError';
import { CONNECTION_ERROR, EMAIL_FORMAT, MIN_PASSWORD, USERNAME_FORMAT } from '../auth/RegisterForm';

import styles from './ProfileForm.module.scss';

interface ProfileFormProps {
    user: {
        name: string;
        username: string;
        email: string;
        verified: boolean;
    };
}

export function ProfileForm({ user }: ProfileFormProps) {
    const router = useRouter();
    const supabase = getSupabase();
    const passwordHintId = useId();
    const errorId = useId();

    const [name, setName] = useState(user.name);
    const [username, setUsername] = useState(user.username);
    const [email, setEmail] = useState(user.email);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    function fail(message: string) {
        setLoading(false);
        setError(message);
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);
        setNotice(null);

        const cleanName = name.trim();
        const cleanUsername = username.trim().toLowerCase();
        const cleanEmail = email.trim();

        if (!cleanName)
            return fail('ERRO: Informe seu nome.');
        if (!USERNAME_FORMAT.test(cleanUsername))
            return fail('ERRO: Use de 3 a 30 letras minúsculas, números, ponto ou _ no nome de usuário.');
        if (!EMAIL_FORMAT.test(cleanEmail))
            return fail('ERRO: Informe um e-mail válido.');
        if (password && password.length < MIN_PASSWORD)
            return fail(`ERRO: A senha precisa ter pelo menos ${MIN_PASSWORD} caracteres.`);
        if (password !== confirmPassword)
            return fail('ERRO: As senhas não coincidem.');

        // demonstration mode: nothing is saved
        if (!supabase) {
            setNotice('Modo demonstração: nada foi salvo.');
            return;
        }

        setLoading(true);

        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) return fail('ERRO: Sessão expirada. Entre de novo.');

        const nameChanged = cleanName !== user.name;
        const usernameChanged = cleanUsername !== user.username;

        if (usernameChanged) {
            const { data: available, error: checkError } = await supabase
                .rpc('is_username_available', { p_username: cleanUsername });

            if (checkError) return fail(`ERRO: ${CONNECTION_ERROR}`);
            if (!available) return fail('ERRO: Este nome de usuário já está em uso.');
        }

        if (nameChanged || usernameChanged) {
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ full_name: cleanName, username: cleanUsername })
                .eq('id', authUser.id);

            if (updateError) {
                return fail(updateError.code === '23505'
                    ? 'ERRO: Este nome de usuário já está em uso.'
                    : 'ERRO: Não foi possível salvar. Tente novamente.');
            }
        }

        const emailChanged = cleanEmail !== user.email;

        if (emailChanged || password) {
            const { error: authError } = await supabase.auth.updateUser({
                ...(emailChanged && { email: cleanEmail }),
                ...(password && { password }),
            });

            if (authError) {
                if (authError.name === 'AuthRetryableFetchError')
                    return fail(`ERRO: ${CONNECTION_ERROR}`);
                if (authError.code === 'weak_password')
                    return fail('ERRO: Senha muito fraca. Tente outra.');
                if (authError.code === 'same_password')
                    return fail('ERRO: A nova senha precisa ser diferente da atual.');
                if (authError.code === 'reauthentication_needed')
                    return fail('ERRO: Por segurança, saia e entre de novo para trocar a senha.');
                if (authError.code === 'email_exists')
                    return fail('ERRO: Este e-mail já está cadastrado.');
                return fail('ERRO: Não foi possível salvar o e-mail ou a senha. Tente novamente.');
            }
        }

        setPassword('');
        setConfirmPassword('');
        setLoading(false);
        setNotice(emailChanged
            ? 'Perfil salvo! Enviamos um link de confirmação para o novo e-mail.'
            : 'Perfil salvo!');
        router.refresh();
    }

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <fieldset className={styles.group}>
                <legend>Seus dados</legend>

                <Input
                    label='Nome'
                    icon={CaseSensitive}
                    type='text'
                    autoComplete='name'
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <Input
                    label='Nome de usuário'
                    icon={User}
                    type='text'
                    autoComplete='username'
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <Input
                    label='E-mail'
                    icon={Mail}
                    type='email'
                    autoComplete='email'
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </fieldset>

            <div className={styles.verified}>

            {user.verified ? (
                <span className={styles.verified}>
                    <Check aria-hidden='true'/>
                    E-mail verificado
                </span>
            ) : (
                <span className={styles.notVerified}>
                    <X aria-hidden='true'/>
                    E-mail não verificado.
                    <button type='button'>Verificar agora</button>
                    {/* send verification email, change span to 'E-mail de verificação enviado!' */}
                </span>
            )}
            </div>

            <fieldset className={styles.group}>
                <legend>Alterar senha</legend>

                <p id={passwordHintId} className={styles.hint}>
                    Deixe os campos em branco para manter a sua senha atual.
                </p>

                <Input
                    label='Senha'
                    icon={Key}
                    type='password'
                    placeholder='●●●●●●'
                    autoComplete='new-password'
                    aria-describedby={passwordHintId}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <Input
                    label='Confirmar senha'
                    icon={Key}
                    type='password'
                    placeholder='●●●●●●'
                    autoComplete='new-password'
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? errorId : passwordHintId}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
            </fieldset>

            {error && <FormError id={errorId}>{error}</FormError>}

            {notice && <p role='status' className={styles.hint}>{notice}</p>}

            <SaveButton loading={loading}/>
        </form>
    );
}