'use client';

import { useId, useState } from 'react';
import type { FormEvent } from 'react';

import { CaseSensitive, Check, Key, Mail, User, X } from 'lucide-react';

import { Input } from '../Input/Input';
import { SaveButton } from '../Button/SaveButton';
import FormError from '../FormError/FormError';

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
    const passwordHintId = useId();
    const errorId = useId();

    const [name, setName] = useState(user.name);
    const [username, setUsername] = useState(user.username);
    const [email, setEmail] = useState(user.email);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError('ERRO: As senhas não coincidem.');
            return;
        }

        // TODO: salvar as alterações do perfil
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
                    {/*disparar email de verificação, mudar span para 'E-mail de verificação enviado!'*/}
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

            <SaveButton/>
        </form>
    );
}