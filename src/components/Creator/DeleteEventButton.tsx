'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Trash2 } from 'lucide-react';

import { Button } from '#/components/Button/Button';
import FormError from '#/components/FormError/FormError';
import { ConfirmDialog } from '#/components/Modal/ConfirmDialog';
import { getSupabase } from '#/utils/supabase/getSupabase';

interface DeleteEventButtonProps {
    activityId: string;
    title: string;
    backHref: string;
    // PDFs to remove from the bucket along with the activity
    storagePaths: string[];
}

export default function DeleteEventButton({ activityId, title, backHref, storagePaths }: DeleteEventButtonProps) {
    const router = useRouter();
    const supabase = getSupabase();

    const [open,    setOpen]    = useState<boolean>(false);
    const [error,   setError]   = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    async function handleDelete() {
        if (!supabase) {
            setOpen(false);
            return setError('Indisponível no modo demonstração.');
        }

        setLoading(true);
        const { error: deleteError } = await supabase.from('activities').delete().eq('id', activityId);
        if (!deleteError && storagePaths.length) {
            await supabase.storage.from('materials').remove(storagePaths);
        }
        setLoading(false);
        setOpen(false);

        if (deleteError) return setError('Não foi possível excluir a atividade. Tente novamente.');
        router.push(backHref);
        router.refresh();
    }

    return (
        <>
            {error && <FormError>{error}</FormError>}

            <Button variant='danger' icon={Trash2} fullWidth aria-haspopup='dialog' onClick={() => setOpen(true)}>
                Excluir atividade
            </Button>

            <ConfirmDialog
                open={open}
                onClose={() => setOpen(false)}
                onConfirm={handleDelete}
                title={`Excluir "${title}"?`}
                description='As presenças, os materiais e o XP que as mentoradas ganharam nela serão apagados.'
                confirmLabel='Sim, excluir'
                loadingLabel='Excluindo...'
                variant='danger'
                icon={Trash2}
                loading={loading}
            />
        </>
    );
}
