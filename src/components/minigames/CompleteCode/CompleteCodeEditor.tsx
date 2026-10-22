'use client';

import { useId, useRef, useState, type FormEvent } from 'react';

import { Plus, SquareDashed, Trash2, X } from 'lucide-react';

import { Button } from '#/components/Button/Button';
import { SaveButton } from '#/components/Button/SaveButton';
import FormError from '#/components/FormError/FormError';
import { Input } from '#/components/Input/Input';
import { Select } from '#/components/Select/Select';
import { Textarea } from '#/components/Textarea/Textarea';

import CompleteCodePlayer from './CompleteCodePlayer';
import { BLANK_PATTERN, type CompleteCodeAnswer, type CompleteCodeContent, type ItemSolution } from '../types';

import styles from './CompleteCodeEditor.module.scss';

interface CompleteCodeEditorProps {
    content: CompleteCodeContent;
    solution: ItemSolution | null;
    onSave: (content: CompleteCodeContent, solution: ItemSolution) => Promise<string | null>;
    onCancel: () => void;
}

type Option = CompleteCodeContent['options'][number];
type Errors = Partial<Record<'instruction' | 'code' | 'options' | 'answers', string>>;

const newOptionId = () => crypto.randomUUID().slice(0, 8);

// blank numbers in the order they appear in the code
function blanksInCode(code: string) {
    return [...code.matchAll(BLANK_PATTERN)].map((match) => Number(match[1]));
}

// renumbers the blanks 0, 1, 2... in reading order, so deleting one never leaves a gap
function normalize(code: string, answers: Record<number, string | null>) {
    const order = blanksInCode(code);
    const normalizedCode = code.replace(BLANK_PATTERN, (_, number) => `[[${order.indexOf(Number(number))}]]`);
    return { code: normalizedCode, blanks: order.map((number) => answers[number] ?? null) };
}

export default function CompleteCodeEditor({ content, solution, onSave, onCancel }: CompleteCodeEditorProps) {
    const ids = {
        instruction: useId(), code: useId(), codeHelp: useId(), options: useId(),
        answers: useId(), explanation: useId(), error: useId(),
    };
    const codeRef = useRef<HTMLTextAreaElement>(null);

    const [instruction, setInstruction] = useState(content.instruction);
    const [code,        setCode]        = useState(content.code);
    const [options,     setOptions]     = useState<Option[]>(content.options.length
        ? content.options
        : [{ id: newOptionId(), text: '' }, { id: newOptionId(), text: '' }]);
    // answer of each blank, by its number in the code
    const [answers,     setAnswers]     = useState<Record<number, string | null>>(() =>
        Object.fromEntries((solution?.solution.blanks ?? []).map((id, index) => [index, id])));
    const [explanation, setExplanation] = useState(solution?.explanation ?? '');
    const [preview,     setPreview]     = useState<CompleteCodeAnswer>({ blanks: [] });
    // after the first try, errors follow the fields as they change
    const [submitted,   setSubmitted]   = useState<boolean>(false);
    const [saveError,   setSaveError]   = useState<string | null>(null);
    const [loading,     setLoading]     = useState<boolean>(false);

    const blanks = blanksInCode(code);
    const filled = options.filter((option) => option.text.trim());

    function insertBlank() {
        const textarea = codeRef.current;
        const next = blanks.length ? Math.max(...blanks) + 1 : 0;
        const marker = `[[${next}]]`;
        const start = textarea?.selectionStart ?? code.length;
        const end = textarea?.selectionEnd ?? code.length;

        setCode(code.slice(0, start) + marker + code.slice(end));
        requestAnimationFrame(() => {
            textarea?.focus();
            textarea?.setSelectionRange(start + marker.length, start + marker.length);
        });
    }

    function validate(): Errors {
        const found: Errors = {};
        const chosen = blanks.map((number) => answers[number] ?? null);

        if (!instruction.trim()) found.instruction = 'Escreva o enunciado.';

        if (!blanks.length) found.code = 'Insira pelo menos uma lacuna no código.';
        else if (new Set(blanks).size !== blanks.length) found.code = 'Cada lacuna aparece uma vez só no código.';

        if (filled.length < 2) found.options = 'Crie pelo menos dois blocos com texto.';
        else if (filled.length < blanks.length) found.options = 'Precisa de pelo menos um bloco por lacuna.';

        if (chosen.some((id) => !id || !filled.some((option) => option.id === id))) {
            found.answers = 'Escolha a resposta certa de cada lacuna.';
        } else if (new Set(chosen).size !== chosen.length) {
            found.answers = 'Cada bloco só pode ser a resposta de uma lacuna.';
        }

        return found;
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setSaveError(null);

        setSubmitted(true);
        if (Object.keys(validate()).length) return;

        const normalized = normalize(code, answers);

        setLoading(true);
        const error = await onSave(
            { instruction: instruction.trim(), code: normalized.code, options: filled.map((o) => ({ ...o, text: o.text.trim() })) },
            { solution: { blanks: normalized.blanks }, explanation: explanation.trim() || null },
        );
        setLoading(false);

        if (error) setSaveError(error);
    }

    const errors: Errors = submitted ? validate() : {};

    const fieldProps = (field: keyof Errors, describedBy?: string) => ({
        'aria-invalid': errors[field] ? true : undefined,
        'aria-describedby': [describedBy, errors[field] ? `${ids[field]}-error` : undefined]
            .filter(Boolean).join(' ') || undefined,
    });

    const fieldError = (field: keyof Errors) => errors[field] && (
        <p id={`${ids[field]}-error`} className={styles.fieldError}>{errors[field]}</p>
    );

    // what the mentee will see, already renumbered
    const previewItem = {
        id: 'preview',
        type: 'complete_codigo' as const,
        content: { instruction: instruction || 'Complete o código:', code: normalize(code, answers).code, options: filled },
    };
    const previewKey = `${previewItem.content.code}|${filled.map((option) => option.id).join()}`;
    const previewBlanks = preview.blanks.length === blanks.length ? preview : { blanks: blanks.map(() => null) };

    return (
        <form className={styles.editor} onSubmit={handleSubmit} noValidate>
            <fieldset className={styles.group}>
                <legend>Enunciado e código</legend>

                <Input
                    id={ids.instruction}
                    label='Enunciado'
                    required
                    placeholder='Complete o código:'
                    value={instruction}
                    onChange={(event) => setInstruction(event.target.value)}
                    {...fieldProps('instruction')}
                />
                {fieldError('instruction')}

                <div className={styles.field}>
                    <label htmlFor={ids.code}>
                        Código<span className={styles.required} aria-hidden='true'>*</span>
                    </label>
                    <p id={ids.codeHelp} className={styles.help}>
                        Onde a mentorada deve encaixar um bloco, use &quot;Inserir lacuna&quot;.
                        Cada lacuna aparece como [[0]], [[1]]...
                    </p>
                    <Textarea
                        ref={codeRef}
                        id={ids.code}
                        className={styles.code}
                        spellCheck={false}
                        autoCapitalize='off'
                        autoComplete='off'
                        value={code}
                        onChange={(event) => setCode(event.target.value)}
                        {...fieldProps('code', ids.codeHelp)}
                    />
                    {fieldError('code')}
                    <Button icon={SquareDashed} fullWidth onClick={insertBlank}>Inserir lacuna</Button>
                </div>
            </fieldset>

            <fieldset className={styles.group} aria-describedby={errors.options ? `${ids.options}-error` : undefined}>
                <legend>Blocos</legend>
                <p className={styles.help}>A mentorada vê os blocos nesta ordem. Inclua opções erradas também.</p>

                <ul className={styles.options}>
                    {options.map((option, index) => (
                        <li key={option.id}>
                            <Input
                                aria-label={`Bloco ${index + 1}`}
                                className={styles.mono}
                                placeholder={`Bloco ${index + 1}`}
                                value={option.text}
                                onChange={(event) => setOptions(options.map((item) =>
                                    (item.id === option.id ? { ...item, text: event.target.value } : item)))}
                            />
                            <Button
                                variant='danger'
                                icon={Trash2}
                                depth={4}
                                aria-label={`Remover bloco ${index + 1}`}
                                disabled={options.length <= 2}
                                onClick={() => setOptions(options.filter((item) => item.id !== option.id))}
                            />
                        </li>
                    ))}
                </ul>
                {fieldError('options')}

                <Button
                    icon={Plus}
                    fullWidth
                    disabled={options.length >= 8}
                    onClick={() => setOptions([...options, { id: newOptionId(), text: '' }])}
                >
                    Adicionar bloco
                </Button>
            </fieldset>

            <fieldset className={styles.group} aria-describedby={errors.answers ? `${ids.answers}-error` : undefined}>
                <legend>Respostas certas</legend>

                {blanks.length ? blanks.map((number, index) => (
                    <div key={number} className={styles.field}>
                        <label htmlFor={`${ids.answers}-${number}`}>Lacuna {index + 1}</label>
                        <Select
                            id={`${ids.answers}-${number}`}
                            placeholder='Escolha o bloco certo'
                            options={filled.map((option) => ({ value: option.id, label: option.text }))}
                            value={answers[number] ?? ''}
                            onChange={(value) => setAnswers({ ...answers, [number]: value || null })}
                        />
                    </div>
                )) : (
                    <p className={styles.help}>Insira uma lacuna no código para escolher a resposta.</p>
                )}
                {fieldError('answers')}

                <div className={styles.field}>
                    <label htmlFor={ids.explanation}>Explicação</label>
                    <p id={`${ids.explanation}-help`} className={styles.help}>
                        Aparece depois que ela checa a resposta, certa ou errada.
                    </p>
                    <Textarea
                        id={ids.explanation}
                        className={styles.text}
                        aria-describedby={`${ids.explanation}-help`}
                        value={explanation}
                        onChange={(event) => setExplanation(event.target.value)}
                    />
                </div>
            </fieldset>

            <section className={styles.preview} aria-label='Pré-visualização'>
                <h3>Pré-visualização</h3>
                {blanks.length && filled.length ? (
                    <CompleteCodePlayer key={previewKey} item={previewItem} answer={previewBlanks} onChange={setPreview}/>
                ) : (
                    <p className={styles.help}>Escreva o código com uma lacuna e crie os blocos para ver como fica.</p>
                )}
            </section>

            {saveError && <FormError id={ids.error}>{saveError}</FormError>}

            <div className={styles.actions}>
                <SaveButton loading={loading}/>
                <Button icon={X} fullWidth disabled={loading} onClick={onCancel}>Cancelar</Button>
            </div>
        </form>
    );
}
