'use client';

import { useId, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowDown, ArrowUp, Pencil, Play, Sparkles, SquareMousePointer, Trash2, Type } from 'lucide-react';
import { Button } from '#/components/Button/Button';
import { SaveButton } from '#/components/Button/SaveButton';
import FormError from '#/components/FormError/FormError';
import { Input } from '#/components/Input/Input';
import { ConfirmDialog } from '#/components/Modal/ConfirmDialog';
import ActivityPlayer from '#/components/minigames/ActivityPlayer/ActivityPlayer';
import CompleteCodeEditor from '#/components/minigames/CompleteCode/CompleteCodeEditor';
import {
    itemTypes, type ActivityItem, type CompleteCodeContent, type ItemSolution, type ItemType,
} from '#/components/minigames/types';
import type { Json } from '#/types/database';
import type { EditableActivity } from '#/utils/creatorData';
import { getSupabase } from '#/utils/supabase/getSupabase';

import styles from './ActivityEditor.module.scss';

interface ActivityEditorProps {
    data: EditableActivity;
    backHref: string;
}

// item being edited; id null = new item
interface Editing {
    id: string | null;
    type: ItemType;
    content: CompleteCodeContent;
    solution: ItemSolution | null;
}

const emptyContent: CompleteCodeContent = { instruction: 'Complete o código:', code: '', options: [] };

const demoError = 'Indisponível no modo demonstração.';

export default function ActivityEditor({ data, backHref }: ActivityEditorProps) {
    const router = useRouter();
    const supabase = getSupabase();
    const detailsErrorId = useId();

    const { activity, items, solutions } = data;

    const [title,        setTitle]        = useState(activity.title);
    const [points,       setPoints]       = useState(String(activity.points));
    const [detailsError, setDetailsError] = useState<string | null>(null);
    const [savedDetails, setSavedDetails] = useState<boolean>(false);
    const [listError,    setListError]    = useState<string | null>(null);
    const [loading,      setLoading]      = useState<boolean>(false);
    const [editing,      setEditing]      = useState<Editing | null>(null);
    const [testing,      setTesting]      = useState<boolean>(false);
    const [toDelete,     setToDelete]     = useState<ActivityItem | null>(null);
    const [deleteOpen,   setDeleteOpen]   = useState<boolean>(false);

    async function handleDetails(event: FormEvent) {
        event.preventDefault();
        setDetailsError(null);
        setSavedDetails(false);

        const xp = Number(points);
        if (!title.trim()) return setDetailsError('Dê um título para a atividade.');
        if (!Number.isInteger(xp) || xp < 1 || xp > 1000) return setDetailsError('O XP deve ser um número inteiro de 1 a 1000.');
        if (!supabase) return setDetailsError(demoError);

        setLoading(true);
        const { error } = await supabase.from('activities')
            .update({ title: title.trim(), points: xp }).eq('id', activity.id);
        setLoading(false);

        if (error) return setDetailsError('Não foi possível salvar. Tente novamente.');
        setSavedDetails(true);
        router.refresh();
    }

    async function handleSaveItem(content: CompleteCodeContent, solution: ItemSolution) {
        if (!supabase) return demoError;

        const { error } = await supabase.rpc('save_activity_item', {
            p_activity_id: activity.id,
            // null creates a new item at the end
            p_item_id: editing?.id ?? (null as unknown as string),
            p_type: editing!.type,
            p_content: content as unknown as Json,
            p_solution: solution.solution as unknown as Json,
            p_explanation: solution.explanation ?? '',
        });

        if (error) return 'Não foi possível salvar o item. Tente novamente.';
        setEditing(null);
        router.refresh();
        return null;
    }

    async function move(index: number, direction: -1 | 1) {
        setListError(null);
        if (!supabase) return setListError(demoError);

        const order = items.map((item) => item.id);
        [order[index], order[index + direction]] = [order[index + direction], order[index]];

        setLoading(true);
        const { error } = await supabase.rpc('reorder_activity_items', {
            p_activity_id: activity.id,
            p_item_ids: order,
        });
        setLoading(false);

        if (error) return setListError('Não foi possível mudar a ordem. Tente novamente.');
        router.refresh();
    }

    async function handleDeleteItem() {
        if (!toDelete) return;
        if (!supabase) {
            setToDelete(null);
            return setListError(demoError);
        }

        setLoading(true);
        const { error } = await supabase.from('activity_items').delete().eq('id', toDelete.id);
        setLoading(false);
        setToDelete(null);

        if (error) return setListError('Não foi possível excluir o item. Tente novamente.');
        router.refresh();
    }

    async function handleDeleteActivity() {
        if (!supabase) {
            setDeleteOpen(false);
            return setListError(demoError);
        }

        setLoading(true);
        const { error } = await supabase.from('activities').delete().eq('id', activity.id);
        setLoading(false);
        setDeleteOpen(false);

        if (error) return setListError('Não foi possível excluir a atividade. Tente novamente.');
        router.push(backHref);
        router.refresh();
    }

    if (testing) {
        return (
            <ActivityPlayer
                activityId={activity.id}
                points={Number(points) || activity.points}
                items={items}
                solutions={solutions}
                onExit={() => setTesting(false)}
            />
        );
    }

    if (editing) {
        return (
            <section className={styles.section} aria-labelledby='item-editor-title'>
                <h2 id='item-editor-title'>
                    {editing.id ? 'Editar item' : 'Novo item'}: {itemTypes[editing.type].label}
                </h2>
                <CompleteCodeEditor
                    content={editing.content}
                    solution={editing.solution}
                    onSave={handleSaveItem}
                    onCancel={() => setEditing(null)}
                />
            </section>
        );
    }

    return (
        <>
            <section className={styles.section} aria-labelledby='details-title'>
                <h2 id='details-title'>Dados da atividade</h2>

                <form className={styles.details} onSubmit={handleDetails} noValidate>
                    <Input
                        label='Título'
                        icon={Type}
                        required
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        aria-invalid={detailsError && !title.trim() ? true : undefined}
                        aria-describedby={detailsError ? detailsErrorId : undefined}
                    />
                    <Input
                        label='XP máximo'
                        help='XP de quem acerta tudo. Com menos acertos, ela ganha uma parte proporcional.'
                        icon={Sparkles}
                        type='number'
                        inputMode='numeric'
                        min={1}
                        max={1000}
                        required
                        value={points}
                        onChange={(event) => setPoints(event.target.value)}
                        aria-describedby={detailsError ? detailsErrorId : undefined}
                    />

                    {detailsError && <FormError id={detailsErrorId}>{detailsError}</FormError>}
                    {savedDetails && <p className={styles.saved} role='status'>Dados salvos.</p>}

                    <SaveButton loading={loading}/>
                </form>
            </section>

            <section className={styles.section} aria-labelledby='items-title'>
                <h2 id='items-title'>Itens ({items.length})</h2>

                {items.length ? (
                    <ol className={styles.items}>
                        {items.map((item, index) => (
                            <li key={item.id} className={styles.item}>
                                <div className={styles.itemInfo}>
                                    <span className={styles.number}>{index + 1}</span>
                                    <div>
                                        <p className={styles.type}>{itemTypes[item.type].label}</p>
                                        <p className={styles.instruction}>{item.content.instruction}</p>
                                    </div>
                                </div>

                                <pre className={styles.code}>{item.content.code}</pre>

                                <div className={styles.itemActions}>
                                    <Button
                                        icon={Pencil}
                                        depth={4}
                                        aria-label={`Editar item ${index + 1}`}
                                        onClick={() => setEditing({
                                            id: item.id,
                                            type: item.type,
                                            content: item.content,
                                            solution: solutions[item.id] ?? null,
                                        })}
                                    />
                                    <Button
                                        icon={ArrowUp}
                                        depth={4}
                                        aria-label={`Subir item ${index + 1}`}
                                        disabled={loading || index === 0}
                                        onClick={() => move(index, -1)}
                                    />
                                    <Button
                                        icon={ArrowDown}
                                        depth={4}
                                        aria-label={`Descer item ${index + 1}`}
                                        disabled={loading || index === items.length - 1}
                                        onClick={() => move(index, 1)}
                                    />
                                    <Button
                                        variant='danger'
                                        icon={Trash2}
                                        depth={4}
                                        aria-label={`Excluir item ${index + 1}`}
                                        aria-haspopup='dialog'
                                        disabled={loading}
                                        onClick={() => setToDelete(item)}
                                    />
                                </div>
                            </li>
                        ))}
                    </ol>
                ) : (
                    <p className={styles.empty}>Nenhum item ainda. Adicione o primeiro abaixo.</p>
                )}

                {listError && <FormError>{listError}</FormError>}

                <div className={styles.add}>
                    <h3>Adicionar item</h3>
                    {(Object.keys(itemTypes) as ItemType[]).map((type) => (
                        <Button
                            key={type}
                            variant='outline'
                            icon={SquareMousePointer}
                            fullWidth
                            onClick={() => setEditing({ id: null, type, content: emptyContent, solution: null })}
                        >
                            {itemTypes[type].label}
                        </Button>
                    ))}
                </div>

                <Button
                    variant='brand'
                    icon={Play}
                    fullWidth
                    disabled={!items.length}
                    onClick={() => setTesting(true)}
                >
                    Testar atividade
                </Button>
            </section>

            <section className={styles.section} aria-labelledby='danger-title'>
                <h2 id='danger-title'>Excluir</h2>
                {data.branchCount ? (
                    <p className={styles.empty}>
                        Há {data.branchCount} {data.branchCount === 1 ? 'atividade presencial ligada' : 'atividades presenciais ligadas'} a
                        esta atividade. Ligue-as a outro nó ou exclua-as antes.
                    </p>
                ) : (
                    <Button
                        variant='danger'
                        icon={Trash2}
                        fullWidth
                        aria-haspopup='dialog'
                        onClick={() => setDeleteOpen(true)}
                    >
                        Excluir atividade
                    </Button>
                )}
            </section>

            <ConfirmDialog
                open={!!toDelete}
                onClose={() => setToDelete(null)}
                onConfirm={handleDeleteItem}
                title='Excluir este item?'
                description='As respostas já dadas a ele também serão apagadas.'
                confirmLabel='Sim, excluir'
                loadingLabel='Excluindo...'
                variant='danger'
                icon={Trash2}
                loading={loading}
            />

            <ConfirmDialog
                open={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                onConfirm={handleDeleteActivity}
                title={`Excluir "${activity.title}"?`}
                description='Os itens, as tentativas e o XP que as mentoradas ganharam nela serão apagados.'
                confirmLabel='Sim, excluir'
                loadingLabel='Excluindo...'
                variant='danger'
                icon={Trash2}
                loading={loading}
            />
        </>
    );
}
