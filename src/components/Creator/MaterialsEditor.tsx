'use client';

import { useId, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

import { FileText, Link2, Plus, Trash2, Type } from 'lucide-react';

import { Button } from '#/components/Button/Button';
import FormError from '#/components/FormError/FormError';
import { Input } from '#/components/Input/Input';
import { Textarea } from '#/components/Textarea/Textarea';
import { ConfirmDialog } from '#/components/Modal/ConfirmDialog';
import type { Material } from '#/utils/creatorData';
import { getSupabase } from '#/utils/supabase/getSupabase';

import styles from './MaterialsEditor.module.scss';

interface MaterialsEditorProps {
    activityId: string;
    materials: Material[];
}

type Kind = 'pdf' | 'link' | 'texto';

const kindLabels: Record<Kind, string> = { pdf: 'PDF', link: 'Link', texto: 'Texto' };
const kindIcons = { pdf: FileText, link: Link2, texto: Type };

const MAX_PDF_MB = 10;

export default function MaterialsEditor({ activityId, materials }: MaterialsEditorProps) {
    const router = useRouter();
    const supabase = getSupabase();
    const ids = { kind: useId(), file: useId(), body: useId(), error: useId() };

    const [kind,     setKind]     = useState<Kind>('pdf');
    const [title,    setTitle]    = useState('');
    const [url,      setUrl]      = useState('');
    const [body,     setBody]     = useState('');
    const [file,     setFile]     = useState<File | null>(null);
    const [error,    setError]    = useState<string | null>(null);
    const [loading,  setLoading]  = useState<boolean>(false);
    const [toDelete, setToDelete] = useState<Material | null>(null);
    // the file input is cleared by remounting it
    const [fileKey,  setFileKey]  = useState<number>(0);

    function validate() {
        if (!title.trim()) return 'Dê um título para o material.';
        if (kind === 'pdf') {
            if (!file) return 'Escolha o arquivo PDF.';
            if (file.type !== 'application/pdf') return 'O arquivo precisa ser um PDF.';
            if (file.size > MAX_PDF_MB * 1024 * 1024) return `O PDF pode ter até ${MAX_PDF_MB} MB.`;
        }
        if (kind === 'link' && !/^https?:\/\/\S+\.\S+/.test(url.trim())) return 'Cole um link completo, começando com https://';
        if (kind === 'texto' && !body.trim()) return 'Escreva o texto.';
        return null;
    }

    async function handleAdd(event: FormEvent) {
        event.preventDefault();
        setError(null);

        const invalid = validate();
        if (invalid) return setError(invalid);
        if (!supabase) return setError('Indisponível no modo demonstração.');

        setLoading(true);

        let storagePath: string | null = null;
        if (kind === 'pdf' && file) {
            // <activity_id>/<random>-<name>: the bucket policy reads the activity from the folder
            const safeName = file.name.normalize('NFD').replace(/[^\w.-]+/g, '-').slice(-60);
            storagePath = `${activityId}/${crypto.randomUUID().slice(0, 8)}-${safeName}`;
            const { error: uploadError } = await supabase.storage
                .from('materials').upload(storagePath, file, { contentType: 'application/pdf' });
            if (uploadError) {
                setLoading(false);
                return setError('Não foi possível enviar o PDF. Tente novamente.');
            }
        }

        const { error: insertError } = await supabase.from('activity_materials').insert({
            activity_id: activityId,
            position: materials.length + 1,
            kind,
            title: title.trim(),
            url: kind === 'link' ? url.trim() : null,
            body: kind === 'texto' ? body.trim() : null,
            storage_path: storagePath,
        });

        setLoading(false);

        if (insertError) {
            if (storagePath) await supabase.storage.from('materials').remove([storagePath]);
            return setError('Não foi possível adicionar o material. Tente novamente.');
        }

        setTitle('');
        setUrl('');
        setBody('');
        setFile(null);
        setFileKey((key) => key + 1);
        router.refresh();
    }

    async function handleDelete() {
        if (!toDelete) return;
        if (!supabase) {
            setToDelete(null);
            return setError('Indisponível no modo demonstração.');
        }

        setLoading(true);
        const { error: deleteError } = await supabase.from('activity_materials').delete().eq('id', toDelete.id);
        if (!deleteError && toDelete.storage_path) {
            await supabase.storage.from('materials').remove([toDelete.storage_path]);
        }
        setLoading(false);
        setToDelete(null);

        if (deleteError) return setError('Não foi possível excluir o material. Tente novamente.');
        router.refresh();
    }

    return (
        <div className={styles.materials}>
            <p className={styles.help}>A mentorada só vê os materiais depois de confirmar a presença pelo QR Code.</p>

            {materials.length ? (
                <ul className={styles.list}>
                    {materials.map((material) => {
                        const Icon = kindIcons[material.kind as Kind] ?? FileText;
                        return (
                            <li key={material.id}>
                                <Icon aria-hidden='true'/>
                                <div className={styles.info}>
                                    <span className={styles.title}>{material.title}</span>
                                    <span className={styles.kind}>{kindLabels[material.kind as Kind] ?? material.kind}</span>
                                </div>
                                <Button
                                    variant='danger'
                                    icon={Trash2}
                                    depth={4}
                                    aria-label={`Excluir ${material.title}`}
                                    aria-haspopup='dialog'
                                    disabled={loading}
                                    onClick={() => setToDelete(material)}
                                />
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <p className={styles.help}>Nenhum material ainda.</p>
            )}

            <form className={styles.add} onSubmit={handleAdd} noValidate>
                <h3>Adicionar material</h3>

                <fieldset className={styles.kinds}>
                    <legend className='sr-only'>Tipo de material</legend>
                    {(Object.keys(kindLabels) as Kind[]).map((option) => {
                        const Icon = kindIcons[option];
                        return (
                            <label key={option} className={kind === option ? styles.checked : ''}>
                                <input
                                    type='radio'
                                    name={ids.kind}
                                    value={option}
                                    checked={kind === option}
                                    onChange={() => setKind(option)}
                                />
                                <Icon aria-hidden='true'/>
                                {kindLabels[option]}
                            </label>
                        );
                    })}
                </fieldset>

                <Input
                    label='Título'
                    icon={Type}
                    required
                    placeholder='Slides da oficina'
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                {kind === 'pdf' && (
                    <div className={styles.field}>
                        <label htmlFor={ids.file}>Arquivo PDF (até {MAX_PDF_MB} MB)</label>
                        <input
                            key={fileKey}
                            id={ids.file}
                            className={styles.file}
                            type='file'
                            accept='application/pdf'
                            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                        />
                    </div>
                )}

                {kind === 'link' && (
                    <Input
                        label='Link'
                        icon={Link2}
                        type='url'
                        required
                        placeholder='https://'
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />
                )}

                {kind === 'texto' && (
                    <div className={styles.field}>
                        <label htmlFor={ids.body}>Texto</label>
                        <Textarea
                            id={ids.body}
                            className={styles.textarea}
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                        />
                    </div>
                )}

                {error && <FormError id={ids.error}>{error}</FormError>}

                <Button
                    type='submit'
                    variant='outline'
                    icon={Plus}
                    fullWidth
                    disabled={loading}
                    aria-busy={loading}
                    aria-describedby={error ? ids.error : undefined}
                >
                    {loading ? 'Adicionando...' : 'Adicionar material'}
                </Button>
            </form>

            <ConfirmDialog
                open={!!toDelete}
                onClose={() => setToDelete(null)}
                onConfirm={handleDelete}
                title='Excluir este material?'
                description={toDelete ? `"${toDelete.title}" deixa de aparecer para as mentoradas.` : undefined}
                confirmLabel='Sim, excluir'
                loadingLabel='Excluindo...'
                variant='danger'
                icon={Trash2}
                loading={loading}
            />
        </div>
    );
}
