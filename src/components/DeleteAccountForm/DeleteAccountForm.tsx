'use client';

import { useId, useState } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';

import { Key, Trash2 } from 'lucide-react';

import { getSupabase } from '#/utils/supabase/getSupabase';
import { Button } from '../Button/Button';
import { Input } from '../Input/Input';
import { Textarea } from '../Textarea/Textarea';
import FormError from '../FormError/FormError';
import { CONNECTION_ERROR } from '../auth/RegisterForm';

import styles from './DeleteAccountForm.module.scss';

interface DeleteAccountFormProps {
    email: string;
}

export function DeleteAccountForm({ email }: DeleteAccountFormProps) {
    const router = useRouter();
    const supabase = getSupabase();
    const errorId = useId();
    const reasonId = useId();

    const [reason, setReason] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<{ onPassword: boolean, message: string } | null>(null);
    const [loading, setLoading] = useState(false);

    function fail(onPassword: boolean, message: string) {
        setLoading(false);
        setError({ onPassword, message });
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);

        // demonstration mode: nothing to delete
        if (!supabase) {
            router.push('/login');
            return;
        }

        setLoading(true);

        // confirms it is really her before deactivating
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

        if (signInError) {
            return signInError.name === 'AuthRetryableFetchError'
                ? fail(false, CONNECTION_ERROR)
                : fail(true, 'Senha incorreta.');
        }

        const { error: deactivateError } = await supabase.rpc('deactivate_account', { p_reason: reason });

        if (deactivateError)
            return fail(false, 'Não foi possível deletar a conta. Tente novamente.');

        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    }

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
                <label htmlFor={reasonId}>Por que você quer deletar? (opcional)</label>
                <Textarea
                    id={reasonId}
                    className={styles.textarea}
                    placeholder='Conte pra gente o que não funcionou. Isso nos ajuda a melhorar.'
                    maxLength={1000}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                />
            </div>

            <Input
                label='Sua senha'
                help='Digite sua senha para confirmar que é você.'
                icon={Key}
                type='password'
                placeholder='●●●●●●'
                autoComplete='current-password'
                required
                aria-invalid={error?.onPassword ? true : undefined}
                aria-describedby={error?.onPassword ? errorId : undefined}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            {error && <FormError id={errorId}>{error.message}</FormError>}

            <div className={styles.actions}>
                <Button
                    variant='danger'
                    type='submit'
                    icon={Trash2}
                    fullWidth
                    disabled={!password || loading}
                    aria-busy={loading}
                >
                    {loading ? 'Deletando...' : 'Deletar minha conta'}
                </Button>

                <Button href='/settings/profile' variant='outline' fullWidth>
                    Cancelar
                </Button>
            </div>
        </form>
    );
}
