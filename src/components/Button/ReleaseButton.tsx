'use client';

import { useId, useState } from 'react';
import { useRouter } from 'next/navigation';

import { HeartCrack } from 'lucide-react';

import { getSupabase } from '#/utils/supabase/getSupabase';

import { Button } from './Button';
import FormError from '../FormError/FormError';
import { Modal } from '../Modal/Modal';

interface ReleaseButtonProps {
    enrollmentId: string;
    menteeName: string;
    variant?: 'icon' | 'full';
    onDone?: () => void;
}

export function ReleaseButton({ enrollmentId, menteeName, variant = 'full', onDone }: ReleaseButtonProps) {
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

        const { error: releaseError } = await supabase.rpc('release_mentee', { p_enrollment_id: enrollmentId });

        setLoading(false);

        if (releaseError) {
            if (releaseError.code === 'P0002') return setError('Essa mentorada não é mais sua.');
            return setError('Não foi possível cancelar. Tente novamente.');
        }

        // refetches: she goes back to "available for adoption"
        handleClose();
        onDone?.();
        router.refresh();
    }

    return (
        <>
            {variant === 'icon' ? (
                <Button
                    variant='danger'
                    icon={HeartCrack}
                    depth={4}
                    aria-haspopup='dialog'
                    aria-label={`Cancelar adoção da ${menteeName}`}
                    onClick={() => setOpen(true)}
                />
            ) : (
                <Button
                    variant='danger'
                    icon={HeartCrack}
                    fullWidth
                    aria-haspopup='dialog'
                    aria-label={`Cancelar adoção da ${menteeName}`}
                    onClick={() => setOpen(true)}
                >
                    Cancelar
                </Button>
            )}

            <Modal
                open={open}
                onClose={handleClose}
                title={`Cancelar adoção da ${menteeName.trim().split(/\s+/)[0]}?`}
                icon={HeartCrack}
                description='Você deixará de ser a mentora responsável por ela e outra mentora poderá adotá-la.'
                dismissible={!loading}
                actions={
                    <>
                        <Button
                            fullWidth
                            variant='danger'
                            icon={HeartCrack}
                            disabled={loading}
                            aria-busy={loading}
                            aria-describedby={error ? errorId : undefined}
                            onClick={handleConfirm}
                        >
                            {loading ? 'Cancelando...' : 'Sim, cancelar'}
                        </Button>

                        <Button fullWidth data-autofocus disabled={loading} onClick={handleClose}>
                            Voltar
                        </Button>
                    </>
                }
            >
                {error && <FormError id={errorId}>{error}</FormError>}
            </Modal>
        </>
    );
}
