'use client';

import { useId, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

import { CalendarDays, Clock, MapPin, Sparkles, Type } from 'lucide-react';

import { SaveButton } from '#/components/Button/SaveButton';
import FormError from '#/components/FormError/FormError';
import { Input } from '#/components/Input/Input';
import { Select } from '#/components/Select/Select';
import { Textarea } from '#/components/Textarea/Textarea';
import type { EventRow } from '#/utils/creatorData';
import { fromSaoPauloInputs, toSaoPauloInputs } from '#/utils/dates';
import { getSupabase } from '#/utils/supabase/getSupabase';

import styles from './EventForm.module.scss';

interface EventFormProps {
    editionId: string;
    // null: new event
    event: EventRow | null;
    parents: { id: string; label: string }[];
}

type Field = 'title' | 'date' | 'start' | 'end' | 'points' | 'parent';

export default function EventForm({ editionId, event, parents }: EventFormProps) {
    const router = useRouter();
    const supabase = getSupabase();
    const ids = { description: useId(), parent: useId(), error: useId(), errors: useId() };

    const startsAt = event?.starts_at ? toSaoPauloInputs(event.starts_at) : null;

    const [title,       setTitle]       = useState(event?.title ?? '');
    const [description, setDescription] = useState(event?.description ?? '');
    const [date,        setDate]        = useState(startsAt?.date ?? '');
    const [start,       setStart]       = useState(startsAt?.time ?? '');
    const [end,         setEnd]         = useState(event?.ends_at ? toSaoPauloInputs(event.ends_at).time : '');
    const [location,    setLocation]    = useState(event?.location ?? '');
    const [points,      setPoints]      = useState(String(event?.points ?? 20));
    const [parentId,    setParentId]    = useState(event?.parent_id ?? '');
    const [submitted,   setSubmitted]   = useState<boolean>(false);
    const [saveError,   setSaveError]   = useState<string | null>(null);
    const [saved,       setSaved]       = useState<boolean>(false);
    const [loading,     setLoading]     = useState<boolean>(false);

    function validate() {
        const found: Partial<Record<Field, string>> = {};
        const xp = Number(points);

        if (!title.trim()) found.title = 'Dê um título para a atividade.';
        if (!date) found.date = 'Escolha a data.';
        if (!start) found.start = 'Escolha o horário de início.';
        if (end && start && end < start) found.end = 'O fim precisa ser depois do início.';
        if (!Number.isInteger(xp) || xp < 1 || xp > 1000) found.points = 'O XP deve ser um número inteiro de 1 a 1000.';
        if (!parentId) found.parent = 'Escolha a atividade à distância relacionada.';

        return found;
    }

    // after the first try, errors follow the fields as they change
    const errors = submitted ? validate() : {};

    const fieldProps = (field: Field) => ({
        'aria-invalid': errors[field] ? true : undefined,
        'aria-describedby': errors[field] ? `${ids.errors}-${field}` : undefined,
    });

    const fieldError = (field: Field) => errors[field] && (
        <p id={`${ids.errors}-${field}`} className={styles.fieldError}>{errors[field]}</p>
    );

    async function handleSubmit(formEvent: FormEvent) {
        formEvent.preventDefault();
        setSaveError(null);
        setSaved(false);
        setSubmitted(true);

        if (Object.keys(validate()).length) return;
        if (!supabase) return setSaveError('Indisponível no modo demonstração.');

        const values = {
            title: title.trim(),
            description: description.trim() || null,
            starts_at: fromSaoPauloInputs(date, start),
            ends_at: end ? fromSaoPauloInputs(date, end) : null,
            location: location.trim() || null,
            points: Number(points),
            parent_id: parentId,
        };

        setLoading(true);

        if (event) {
            const { error } = await supabase.from('activities').update(values).eq('id', event.id);
            setLoading(false);
            if (error) return setSaveError('Não foi possível salvar. Tente novamente.');
            setSaved(true);
            router.refresh();
            return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        const { data, error } = user
            ? await supabase.from('activities')
                .insert({ ...values, edition_id: editionId, kind: 'presencial', created_by: user.id })
                .select('id').single()
            : { data: null, error: true };

        setLoading(false);
        if (error || !data) return setSaveError('Não foi possível criar a atividade. Tente novamente.');
        // now the materials and the QR Code can be added
        router.replace(`/team/create/${data.id}`);
    }

    if (!parents.length) {
        return (
            <p className={styles.empty}>
                Crie uma atividade à distância antes: a presencial aparece ao lado dela na trilha.
            </p>
        );
    }

    return (
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <Input
                label='Título'
                icon={Type}
                required
                placeholder='Oficina de HTML'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                {...fieldProps('title')}
            />
            {fieldError('title')}

            <div className={styles.field}>
                <label htmlFor={ids.description}>Descrição</label>
                <Textarea
                    id={ids.description}
                    className={styles.textarea}
                    placeholder='O que vai acontecer no encontro'
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>

            <Input
                label='Data'
                icon={CalendarDays}
                type='date'
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                {...fieldProps('date')}
            />
            {fieldError('date')}

            <div className={styles.row}>
                <div>
                    <Input
                        label='Início'
                        icon={Clock}
                        type='time'
                        required
                        value={start}
                        onChange={(e) => setStart(e.target.value)}
                        {...fieldProps('start')}
                    />
                    {fieldError('start')}
                </div>
                <div>
                    <Input
                        label='Fim'
                        icon={Clock}
                        type='time'
                        value={end}
                        onChange={(e) => setEnd(e.target.value)}
                        {...fieldProps('end')}
                    />
                    {fieldError('end')}
                </div>
            </div>

            <Input
                label='Local'
                icon={MapPin}
                placeholder='UTFPR-CP, laboratório P-101'
                value={location}
                onChange={(e) => setLocation(e.target.value)}
            />

            <Input
                label='XP da presença'
                help='XP que ela ganha ao confirmar a presença pelo QR Code.'
                icon={Sparkles}
                type='number'
                inputMode='numeric'
                min={1}
                max={1000}
                required
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                {...fieldProps('points')}
            />
            {fieldError('points')}

            <div className={styles.field}>
                <label htmlFor={ids.parent}>
                    Atividade à distância relacionada<span className={styles.required} aria-hidden='true'>*</span>
                </label>
                <p id={`${ids.parent}-help`} className={styles.help}>
                    A presencial aparece ao lado dela na trilha, sem bloquear nada.
                </p>
                <Select
                    id={ids.parent}
                    required
                    placeholder='Escolha a atividade'
                    options={parents.map((parent) => ({ value: parent.id, label: parent.label }))}
                    value={parentId}
                    onChange={setParentId}
                    aria-invalid={errors.parent ? true : undefined}
                    aria-describedby={[`${ids.parent}-help`, errors.parent && `${ids.errors}-parent`]
                        .filter(Boolean).join(' ')}
                />
                {fieldError('parent')}
            </div>

            {saveError && <FormError id={ids.error}>{saveError}</FormError>}
            {saved && <p className={styles.saved} role='status'>Dados salvos.</p>}

            <SaveButton loading={loading}/>
        </form>
    );
}
