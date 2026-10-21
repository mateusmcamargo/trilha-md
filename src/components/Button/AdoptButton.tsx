'use client';

import { useId, useState } from 'react';
import { useRouter } from 'next/navigation';

import { HeartHandshake } from 'lucide-react';

import { getSupabase } from '#/utils/supabase/getSupabase';

import { Button } from './Button';
import FormError from '../FormError/FormError';
import { Modal } from '../Modal/Modal';

interface AdoptButtonProps {
    enrollmentId: string;
    menteeName: string;
    variant?: 'icon' | 'full';
    onDone?: () => void;
}

export function AdoptButton({ enrollmentId, menteeName, variant = 'full', onDone }: AdoptButtonProps) {
    const router   = useRouter();
    const supabase = getSupabase();
    const errorId  = useId();

    const [open,    setOpen]    = useState<boolean>(false);
    const [error,   setError]   = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    function handleClose() {
        setOpen(false);
        setError(null);
    }

    async function handleConfirm() {
        setError(null);

        if (!supabase) return setError('Indisponível no modo demonstração.');

        setLoading(true);

        const { error: adoptError } = await supabase.rpc('adopt_mentee', { p_enrollment_id: enrollmentId });

        setLoading(false);

        if (adoptError) {
            if (adoptError.code === 'P0002') return setError('Essa mentorada já tem uma mentora.');
            return setError('Não foi possível adotar. Tente novamente.');
        }

        // refetches: she moves to "Suas mentoradas"
        handleClose();
        onDone?.();
        router.refresh();
    }

    return (
        <>
            {variant === 'icon' ? (
                <Button
                    variant='brand'
                    icon={HeartHandshake}
                    depth={4}
                    aria-haspopup='dialog'
                    aria-label={`Adotar ${menteeName}`}
                    onClick={() => setOpen(true)}
                />
            ) : (
                <Button
                    variant='brand'
                    icon={HeartHandshake}
                    fullWidth
                    aria-haspopup='dialog'
                    aria-label={`Adotar ${menteeName}`}
                    onClick={() => setOpen(true)}
                >
                    Adotar
                </Button>
            )}

            <Modal
                open={open}
                onClose={handleClose}
                title={`Adotar a ${menteeName.trim().split(/\s+/)[0]}?`}
                icon={HeartHandshake}
                description='Você passará a ser a mentora responsável por ela nesta trilha.'
                dismissible={!loading}
                actions={
                    <>
                        <Button
                            fullWidth
                            variant='brand'
                            icon={HeartHandshake}
                            disabled={loading}
                            aria-busy={loading}
                            aria-describedby={error ? errorId : undefined}
                            onClick={handleConfirm}
                        >
                            {loading ? 'Adotando...' : 'Sim, adotar'}
                        </Button>

                        <Button
                            fullWidth
                            data-autofocus
                            disabled={loading}
                            onClick={handleClose}
                        >
                            Cancelar
                        </Button>
                    </>
                }
            >
                {error && <FormError id={errorId}>{error}</FormError>}
            </Modal>
        </>
    );
}
