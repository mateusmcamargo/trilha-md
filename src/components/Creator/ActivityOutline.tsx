'use client';

import { useId, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ArrowDown, ArrowUp, CalendarDays, CalendarPlus, Gamepad2, Pencil, Plus } from 'lucide-react';

import { Button } from '#/components/Button/Button';
import FormError from '#/components/FormError/FormError';
import { Select } from '#/components/Select/Select';
import type { CreatorEdition, OutlineActivity } from '#/utils/creatorData';
import { getSupabase } from '#/utils/supabase/getSupabase';

import styles from './ActivityOutline.module.scss';

interface ActivityOutlineProps {
    editions: CreatorEdition[];
    editionId: string;
    activities: OutlineActivity[];
}

const formatDate = (timestamp: string) => new Date(timestamp).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo',
});

const itemCount = (count: number) => `${count} ${count === 1 ? 'item' : 'itens'}`;

export default function ActivityOutline({ editions, editionId, activities }: ActivityOutlineProps) {
    const router = useRouter();
    const supabase = getSupabase();
    const selectId = useId();

    const [error,   setError]   = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    async function move(index: number, direction: -1 | 1) {
        setError(null);
        if (!supabase) return setError('Indisponível no modo demonstração.');

        const order = activities.map((activity) => activity.id);
        [order[index], order[index + direction]] = [order[index + direction], order[index]];

        setLoading(true);
        const { error: reorderError } = await supabase.rpc('reorder_activities', {
            p_edition_id: editionId,
            p_activity_ids: order,
        });
        setLoading(false);

        if (reorderError) return setError('Não foi possível mudar a ordem. Tente novamente.');
        router.refresh();
    }

    async function handleCreate() {
        setError(null);
        if (!supabase) return setError('Indisponível no modo demonstração.');

        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();
        // positions may have gaps after deletions: goes after the highest one
        const { data: last } = await supabase.from('activities')
            .select('position').eq('edition_id', editionId).eq('kind', 'remota')
            .order('position', { ascending: false }).limit(1).maybeSingle();

        const { data, error: createError } = user ? await supabase.from('activities').insert({
            edition_id: editionId,
            kind: 'remota',
            position: (last?.position ?? 0) + 1,
            title: 'Nova atividade',
            points: 30,
            created_by: user.id,
        }).select('id').single() : { data: null, error: true };

        setLoading(false);

        if (createError || !data) return setError('Não foi possível criar a atividade. Tente novamente.');
        router.push(`/team/create/${data.id}`);
    }

    return (
        <div className={styles.outline}>
            <div className={styles.picker}>
                <label htmlFor={selectId}>Edição</label>
                <Select
                    id={selectId}
                    options={editions.map((edition) => ({
                        value: edition.id,
                        label: `${edition.name}${edition.status === 'planning' ? ' (em planejamento)' : ''}`,
                    }))}
                    value={editionId}
                    onChange={(value) => router.push(`/team/create?edicao=${value}`)}
                />
            </div>

            <section className={styles.section} aria-labelledby='outline-title'>
                <h2 id='outline-title'>Atividades da trilha ({activities.length})</h2>

                {activities.length ? (
                    <ol className={styles.list}>
                        {activities.map((activity, index) => (
                            <li key={activity.id} className={styles.activity}>
                                <div className={styles.main}>
                                    <span className={styles.number} aria-hidden='true'>{activity.position}</span>

                                    <div className={styles.info}>
                                        <Link href={`/team/create/${activity.id}`} className={styles.title}>
                                            <Gamepad2 aria-hidden='true'/>
                                            {activity.title}
                                        </Link>
                                        <p className={styles.meta}>
                                            {itemCount(activity.itemCount)} · {activity.points} XP
                                        </p>
                                    </div>

                                    <div className={styles.actions}>
                                        <Button
                                            href={`/team/create/${activity.id}`}
                                            icon={Pencil}
                                            depth={4}
                                            aria-label={`Editar ${activity.title}`}
                                        />
                                        <Button
                                            icon={ArrowUp}
                                            depth={4}
                                            aria-label={`Subir ${activity.title}`}
                                            disabled={loading || index === 0}
                                            onClick={() => move(index, -1)}
                                        />
                                        <Button
                                            icon={ArrowDown}
                                            depth={4}
                                            aria-label={`Descer ${activity.title}`}
                                            disabled={loading || index === activities.length - 1}
                                            onClick={() => move(index, 1)}
                                        />
                                    </div>
                                </div>

                                {activity.branches.length > 0 && (
                                    <ul className={styles.branches} aria-label={`Presenciais ligadas a ${activity.title}`}>
                                        {activity.branches.map((branch) => (
                                            <li key={branch.id}>
                                                <Link href={`/team/create/${branch.id}`}>
                                                    <CalendarDays aria-hidden='true'/>
                                                    <span>{branch.title}</span>
                                                    <span className={styles.date}>{formatDate(branch.startsAt)}</span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        ))}
                    </ol>
                ) : (
                    <p className={styles.empty}>Nenhuma atividade nesta edição ainda. Crie a primeira!</p>
                )}

                {error && <FormError>{error}</FormError>}

                <Button
                    variant='brand'
                    icon={Plus}
                    fullWidth
                    disabled={loading}
                    aria-busy={loading}
                    onClick={handleCreate}
                >
                    Nova atividade à distância
                </Button>

                {activities.length ? (
                    <Button href={`/team/create/novo?edicao=${editionId}`} variant='outline' icon={CalendarPlus} fullWidth>
                        Nova atividade presencial
                    </Button>
                ) : (
                    <p className={styles.empty}>
                        Atividades presenciais ficam ao lado de uma atividade à distância: crie uma antes.
                    </p>
                )}
            </section>
        </div>
    );
}
