'use client';

import { useId, useState, type FormEvent } from 'react';

import { CircleCheck, Send, User } from 'lucide-react';

import { Button } from '#/components/Button/Button';
import { SubmitButton } from '#/components/Button/SubmitButton';
import FormError from '#/components/FormError/FormError';
import { Input } from '#/components/Input/Input';
import { Select } from '#/components/Select/Select';
import { Textarea } from '#/components/Textarea/Textarea';
import { getSupabase } from '#/utils/supabase/getSupabase';

import { ABUSE_CATEGORIES } from './abuseCategories';

import styles from './Settings.module.scss';

const MIN_DESCRIPTION = 10;
const MAX_DESCRIPTION = 2000;

// lets the person go back to the settings of her own area
export function ReportAbuseForm({ backHref }: { backHref: string }) {
    const supabase = getSupabase();
    const ids = { category: useId(), description: useId(), help: useId(), error: useId() };

    const [category,    setCategory]    = useState('');
    const [username,    setUsername]    = useState('');
    const [description, setDescription] = useState('');
    const [error,       setError]       = useState<string | null>(null);
    // the field the error is about, so only it is marked as invalid
    const [errorField,  setErrorField]  = useState<'category' | 'username' | 'description' | null>(null);
    const [loading,     setLoading]     = useState(false);
    const [sent,        setSent]        = useState<'saved' | 'demo' | null>(null);

    function fail(field: typeof errorField, message: string) {
        setErrorField(field);
        setError(message);
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setError(null);
        setErrorField(null);

        const cleanDescription = description.trim();
        const cleanUsername = username.trim().replace(/^@/, '').toLowerCase();

        if (!category) return fail('category', 'ERRO: Escolha o motivo da denúncia.');
        if (cleanUsername.length > 30) return fail('username', 'ERRO: Nome de usuário muito longo.');
        if (cleanDescription.length < MIN_DESCRIPTION)
            return fail('description', `ERRO: Conte o que aconteceu com pelo menos ${MIN_DESCRIPTION} letras.`);

        // demonstration mode: nothing is saved
        if (!supabase) return setSent('demo');

        setLoading(true);

        // no .select(): who reports can't read the reports back (RLS)
        const { error: insertError } = await supabase.from('abuse_reports').insert({
            category,
            description: cleanDescription,
            reported_username: cleanUsername || null,
        });

        setLoading(false);

        if (insertError) return fail(null, 'ERRO: Não foi possível enviar. Tente novamente.');
        setSent('saved');
    }

    if (sent) {
        return (
            <section className={styles.section} role='status'>
                <h2><CircleCheck aria-hidden='true'/> Denúncia enviada</h2>
                <p>
                    {sent === 'demo'
                        ? 'Modo demonstração: nada foi salvo.'
                        : 'Obrigada por avisar! As mentoras vão analisar com cuidado. Se você estiver em perigo, fale agora com um adulto de confiança.'}
                </p>
                <Button href={backHref} variant='outline' fullWidth>Voltar para as configurações</Button>
            </section>
        );
    }

    const invalid = (field: typeof errorField) => (errorField === field ? true : undefined);
    const describedBy = (field: typeof errorField, ...others: string[]) =>
        [...others, errorField === field ? ids.error : null].filter(Boolean).join(' ') || undefined;

    return (
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.field}>
                <label htmlFor={ids.category}>
                    Motivo<span className={styles.required} aria-hidden='true'>*</span>
                </label>
                <Select
                    id={ids.category}
                    required
                    placeholder='Escolha o motivo'
                    options={ABUSE_CATEGORIES}
                    value={category}
                    onChange={setCategory}
                    aria-invalid={invalid('category')}
                    aria-describedby={describedBy('category')}
                />
            </div>

            <Input
                label='Quem? (opcional)'
                help='O nome de usuário da pessoa, se você souber. Exemplo: maria.silva'
                icon={User}
                type='text'
                autoComplete='off'
                autoCapitalize='none'
                spellCheck={false}
                maxLength={31}
                aria-invalid={invalid('username')}
                aria-describedby={describedBy('username')}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />

            <div className={styles.field}>
                <label htmlFor={ids.description}>
                    O que aconteceu?<span className={styles.required} aria-hidden='true'>*</span>
                </label>
                <p id={ids.help} className={styles.help}>
                    Conte com as suas palavras. Só as mentoras leem as denúncias.
                </p>
                <Textarea
                    id={ids.description}
                    className={styles.textarea}
                    required
                    maxLength={MAX_DESCRIPTION}
                    placeholder='Descreva o que aconteceu'
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    aria-invalid={invalid('description')}
                    aria-describedby={describedBy('description', ids.help)}
                />
            </div>

            {error && <FormError id={ids.error}>{error}</FormError>}

            <SubmitButton icon={Send} loading={loading} loadingLabel='Enviando...'>
                Enviar denúncia
            </SubmitButton>
        </form>
    );
}
