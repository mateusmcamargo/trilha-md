'use client';

import { useId, useState } from 'react';
import { useRouter } from 'next/navigation';

import { GraduationCap, HeartHandshake } from 'lucide-react';

import { getSupabase } from '#/utils/supabase/getSupabase';

import Avatar from '../Avatar/Avatar';
import FormError from '../FormError/FormError';
import { Modal } from '../Modal/Modal';
import { Button } from './Button';

import styles from './ChooseMentorButton.module.scss';

interface ChooseMentorButtonProps {
    mentors: { id: string; name: string }[];
}

export function ChooseMentorButton({ mentors }: ChooseMentorButtonProps) {
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

    async function handleChoose(mentorId: string) {
        setError(null);

        if (!supabase) return setError('Indisponível no modo demonstração.');

        setLoading(true);

        const { error: chooseError } = await supabase.rpc('choose_mentor', { p_mentor_id: mentorId });

        setLoading(false);

        if (chooseError) {
            if (chooseError.code === 'P0002') return setError('Você já tem uma tutora.');
            return setError('Não foi possível escolher. Tente novamente.');
        }

        // refetches: the mentor now shows up in the Tutoras tab
        handleClose();
        router.refresh();
    }

    return (
        <>
            <Button
                variant='brand'
                icon={GraduationCap}
                aria-haspopup='dialog'
                onClick={() => setOpen(true)}
            >
                Escolher tutora
            </Button>

            <Modal
                open={open}
                onClose={handleClose}
                title='Escolher tutora'
                icon={GraduationCap}
                description='Ela vai acompanhar você nesta trilha.'
                dismissible={!loading}
            >
                {error && <FormError id={errorId}>{error}</FormError>}

                <ul className={styles.list} aria-describedby={error ? errorId : undefined}>
                    {mentors.map((mentor) => (
                        <li key={mentor.id} className={styles.mentor}>
                            <Avatar name={mentor.name} url={null}/>
                            <h3>{mentor.name}</h3>

                            <Button
                                variant='brand'
                                icon={HeartHandshake}
                                depth={4}
                                disabled={loading}
                                aria-label={`Escolher ${mentor.name}`}
                                onClick={() => handleChoose(mentor.id)}
                            />
                        </li>
                    ))}
                </ul>
            </Modal>
        </>
    );
}
