'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { CircleCheck, CircleX, Pencil, RotateCcw, Route, Sparkles } from 'lucide-react';

import { Button } from '#/components/Button/Button';
import FormError from '#/components/FormError/FormError';
import { getSupabase } from '#/utils/supabase/getSupabase';

import CompleteCodePlayer from '../CompleteCode/CompleteCodePlayer';
import {
    describeSolution, emptyAnswer, isAnswerComplete, isAnswerCorrect,
    type ActivityItem, type CompleteCodeAnswer, type ItemSolution,
} from '../types';

import styles from './ActivityPlayer.module.scss';

interface ActivityPlayerProps {
    activityId: string;
    points: number;
    items: ActivityItem[];
    // with the answer key the correction runs here: demo mode and the mentor's preview
    solutions?: Record<string, ItemSolution>;
    // where "Voltar à trilha" goes at the end
    backHref?: string;
    // mentor's preview: "Voltar ao editor" instead of the link
    onExit?: () => void;
}

interface Checked {
    isCorrect: boolean;
    solution: CompleteCodeAnswer;
    explanation: string | null;
}

interface Result {
    correct: number;
    total: number;
    xp: number;
}

export default function ActivityPlayer({ activityId, points, items, solutions, backHref, onExit }: ActivityPlayerProps) {
    const router = useRouter();
    const supabase = solutions ? null : getSupabase();

    const [attemptId, setAttemptId] = useState<string | null>(null);
    const [index,     setIndex]     = useState<number>(0);
    const [answer,    setAnswer]    = useState<CompleteCodeAnswer>(() => (items[0] ? emptyAnswer(items[0]) : { blanks: [] }));
    const [checked,   setChecked]   = useState<Checked | null>(null);
    const [correct,   setCorrect]   = useState<number>(0);
    const [result,    setResult]    = useState<Result | null>(null);
    const [loading,   setLoading]   = useState<boolean>(!solutions);
    const [error,     setError]     = useState<string | null>(null);

    // opens (or resumes) the attempt and skips the items already answered
    useEffect(() => {
        if (!supabase) return;
        let ignore = false;

        (async () => {
            const { data: id, error: startError } = await supabase.rpc('start_attempt', { p_activity_id: activityId });
            if (ignore) return;
            if (startError || !id) {
                setLoading(false);
                return setError('Não foi possível abrir a atividade. Tente novamente.');
            }

            const { data: answered } = await supabase
                .from('attempt_answers').select('item_id, is_correct').eq('attempt_id', id);
            if (ignore) return;

            const done = new Set(answered?.map((row) => row.item_id));
            const next = items.findIndex((item) => !done.has(item.id));

            // every item answered but not finished (closed the page at the end): just finish it
            if (next === -1) {
                const { data } = await supabase.rpc('finish_attempt', { p_attempt_id: id });
                if (ignore) return;
                setLoading(false);
                if (data?.[0]) setResult(data[0]);
                else setError('Não foi possível terminar a atividade. Tente novamente.');
                return;
            }

            setAttemptId(id);
            setCorrect(answered?.filter((row) => row.is_correct).length ?? 0);
            if (next > 0) {
                setIndex(next);
                setAnswer(emptyAnswer(items[next]));
            }
            setLoading(false);
        })();

        return () => { ignore = true; };
    }, [supabase, activityId, items]);

    const item = items[index];
    const isLast = index === items.length - 1;

    async function handleCheck() {
        setError(null);

        if (solutions) {
            const key = solutions[item.id];
            const isCorrect = !!key && isAnswerCorrect(answer, key.solution);
            setChecked({ isCorrect, solution: key?.solution ?? { blanks: [] }, explanation: key?.explanation ?? null });
            if (isCorrect) setCorrect((count) => count + 1);
            return;
        }

        if (!supabase || !attemptId) return;
        setLoading(true);

        const { data, error: checkError } = await supabase.rpc('check_answer', {
            p_attempt_id: attemptId,
            p_item_id: item.id,
            p_answer: { blanks: answer.blanks },
        });

        setLoading(false);
        const row = data?.[0];
        if (checkError || !row) return setError('Não foi possível checar. Tente novamente.');

        setChecked({
            isCorrect: row.is_correct,
            solution: row.solution as unknown as CompleteCodeAnswer,
            explanation: row.explanation,
        });
        if (row.is_correct) setCorrect((count) => count + 1);
    }

    async function handleContinue() {
        setError(null);

        if (!isLast) {
            setIndex(index + 1);
            setAnswer(emptyAnswer(items[index + 1]));
            setChecked(null);
            return;
        }

        if (solutions) {
            return setResult({ correct, total: items.length, xp: Math.round((points * correct) / items.length) });
        }

        if (!supabase || !attemptId) return;
        setLoading(true);

        const { data, error: finishError } = await supabase.rpc('finish_attempt', { p_attempt_id: attemptId });

        setLoading(false);
        const row = data?.[0];
        if (finishError || !row) return setError('Não foi possível terminar a atividade. Tente novamente.');

        setResult(row);
        // the trail and the header stats change
        router.refresh();
    }

    function handleRestart() {
        setAttemptId(null);
        setIndex(0);
        setAnswer(emptyAnswer(items[0]));
        setChecked(null);
        setCorrect(0);
        setResult(null);
        if (!solutions) {
            // a new attempt: start_attempt opens it since the last one is finished
            setLoading(true);
            supabase?.rpc('start_attempt', { p_activity_id: activityId }).then(({ data, error: startError }) => {
                setLoading(false);
                if (startError || !data) return setError('Não foi possível abrir a atividade. Tente novamente.');
                setAttemptId(data);
            });
        }
    }

    if (result) {
        const score = Math.round((result.correct / result.total) * 100);

        return (
            <section className={styles.result} aria-labelledby='result-title'>
                <h2 id='result-title'>{score === 100 ? 'Perfeito!' : 'Atividade concluída!'}</h2>

                <dl className={styles.scores}>
                    <div>
                        <dt>Acertos</dt>
                        <dd>{result.correct} de {result.total}</dd>
                    </div>
                    <div>
                        <dt>Nota</dt>
                        <dd>{score}%</dd>
                    </div>
                    <div className={styles.xp}>
                        <dt>XP</dt>
                        <dd><Sparkles aria-hidden='true'/>+{result.xp}</dd>
                    </div>
                </dl>

                {!onExit && <p className={styles.hint}>Pode refazer quando quiser: vale a sua melhor tentativa.</p>}

                <div className={styles.actions}>
                    {onExit ? (
                        <Button variant='brand' icon={Pencil} fullWidth onClick={onExit}>Voltar ao editor</Button>
                    ) : (
                        <Button href={backHref ?? '/trail'} variant='brand' icon={Route} fullWidth>Voltar à trilha</Button>
                    )}
                    <Button icon={RotateCcw} fullWidth onClick={handleRestart}>Refazer</Button>
                </div>
            </section>
        );
    }

    if (!item) {
        return <p className={styles.empty}>Esta atividade ainda não tem itens.</p>;
    }

    const progress = Math.round(((index + (checked ? 1 : 0)) / items.length) * 100);

    return (
        <div className={styles.activity}>
            <div
                className={styles.track}
                role='progressbar'
                aria-label='Andamento da atividade'
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
            >
                <div className={styles.fill} style={{ width: `${progress}%` }}/>
            </div>

            <p className={styles.counter}>Item {index + 1} de {items.length}</p>

            <CompleteCodePlayer
                key={item.id}
                item={item}
                answer={answer}
                onChange={setAnswer}
                disabled={!!checked || loading}
            />

            {error && <FormError>{error}</FormError>}

            <div
                className={`${styles.footer} ${checked ? (checked.isCorrect ? styles.correct : styles.wrong) : ''}`}
            >
                {checked && (
                    <div className={styles.feedback} role='status'>
                        <h3>
                            {checked.isCorrect
                                ? <><CircleCheck aria-hidden='true'/>Muito bem!</>
                                : <><CircleX aria-hidden='true'/>Não foi dessa vez</>}
                        </h3>

                        {!checked.isCorrect && (
                            <p>Resposta certa: <code>{describeSolution(item, checked.solution)}</code></p>
                        )}
                        {checked.explanation && <p>{checked.explanation}</p>}
                    </div>
                )}

                {checked ? (
                    <Button
                        variant={checked.isCorrect ? 'brand' : 'danger'}
                        fullWidth
                        disabled={loading}
                        aria-busy={loading}
                        onClick={handleContinue}
                    >
                        {isLast ? 'Ver resultado' : 'Continuar'}
                    </Button>
                ) : (
                    <Button
                        variant='brand'
                        fullWidth
                        disabled={loading || !isAnswerComplete(answer)}
                        aria-busy={loading}
                        onClick={handleCheck}
                    >
                        Checar
                    </Button>
                )}
            </div>
        </div>
    );
}
