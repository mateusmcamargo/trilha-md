'use client';

import { useState } from 'react';
import {
    DndContext, DragOverlay, PointerSensor, useDraggable, useDroppable, useSensor, useSensors,
    type DragEndEvent, type DragStartEvent,
} from '@dnd-kit/core';

import PressableBase from '#/components/PressableBase/PressableBase';

import type { ActivityItem, CompleteCodeAnswer } from '../types';

import styles from './CompleteCodePlayer.module.scss';

interface CompleteCodePlayerProps {
    item: ActivityItem;
    answer: CompleteCodeAnswer;
    onChange: (answer: CompleteCodeAnswer) => void;
    // after checking: nothing moves
    disabled?: boolean;
}

type Option = ActivityItem['content']['options'][number];

function Blank({ index, option, disabled, onClear }: {
    index: number;
    option: Option | undefined;
    disabled: boolean;
    onClear: () => void;
}) {
    const { setNodeRef, isOver } = useDroppable({ id: `blank-${index}`, disabled });

    if (!option) {
        return (
            <span ref={setNodeRef} className={`${styles.blank} ${isOver ? styles.over : ''}`}>
                <span aria-hidden='true'>arraste aqui</span>
                <span className='sr-only'>Lacuna {index + 1}, vazia</span>
            </span>
        );
    }

    return (
        <button
            ref={setNodeRef}
            type='button'
            className={`${styles.blank} ${styles.filled}`}
            onClick={onClear}
            disabled={disabled}
            aria-label={`Lacuna ${index + 1}: ${option.text}. Toque para tirar o bloco`}
        >
            {option.text}
        </button>
    );
}

function Block({ option, used, disabled, onPlace }: {
    option: Option;
    used: boolean;
    disabled: boolean;
    onPlace: () => void;
}) {
    const { setNodeRef, listeners, isDragging } = useDraggable({ id: option.id, disabled: disabled || used });

    // keeps the block's size in the bank, like the empty slot in the example
    if (used) {
        return (
            <span className={`${styles.block} ${styles.used}`} aria-hidden='true'>{option.text}</span>
        );
    }

    return (
        <PressableBase color='var(--color-game-block-base)' depth={6} radius='1.2rem'>
            <button
                ref={setNodeRef}
                type='button'
                className={`${styles.block} ${isDragging ? styles.dragging : ''}`}
                onClick={onPlace}
                disabled={disabled}
                aria-label={`Colocar ${option.text} na próxima lacuna`}
                {...listeners}
            >
                {option.text}
            </button>
        </PressableBase>
    );
}

export default function CompleteCodePlayer({ item, answer, onChange, disabled = false }: CompleteCodePlayerProps) {
    const { instruction, code, options } = item.content;
    const [dragging, setDragging] = useState<Option | null>(null);

    // a small move is still a tap
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

    const optionById = new Map(options.map((option) => [option.id, option]));
    // odd indexes are the blank numbers
    const parts = code.split(/\[\[(\d+)\]\]/);

    const place = (optionId: string, blank?: number) => {
        const blanks = answer.blanks.map((id) => (id === optionId ? null : id));
        const target = blank ?? blanks.indexOf(null);
        if (target === -1) return;
        blanks[target] = optionId;
        onChange({ blanks });
    };

    const clear = (blank: number) => {
        onChange({ blanks: answer.blanks.map((id, index) => (index === blank ? null : id)) });
    };

    const handleDragStart = ({ active }: DragStartEvent) => {
        setDragging(optionById.get(String(active.id)) ?? null);
    };

    const handleDragEnd = ({ active, over }: DragEndEvent) => {
        setDragging(null);
        const match = over && /^blank-(\d+)$/.exec(String(over.id));
        if (match) place(String(active.id), Number(match[1]));
    };

    const text = (id: string | number) => optionById.get(String(id))?.text ?? 'bloco';

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setDragging(null)}
            accessibility={{
                screenReaderInstructions: { draggable: 'Toque no bloco para colocá-lo na próxima lacuna vazia.' },
                announcements: {
                    onDragStart: ({ active }) => `Bloco ${text(active.id)} selecionado.`,
                    onDragOver: ({ over }) => (over ? 'Sobre uma lacuna.' : undefined),
                    onDragEnd: ({ active, over }) => (over
                        ? `Bloco ${text(active.id)} colocado na lacuna.`
                        : `Bloco ${text(active.id)} solto fora das lacunas.`),
                    onDragCancel: ({ active }) => `Bloco ${text(active.id)} devolvido.`,
                },
            }}
        >
            <div className={styles.player}>
                <h2 className={styles.instruction}>{instruction}</h2>

                <pre className={styles.code}>
                    <code>
                        {parts.map((part, index) => {
                            if (index % 2 === 0) return <span key={index}>{part}</span>;
                            const blank = Number(part);
                            const id = answer.blanks[blank];
                            return (
                                <Blank
                                    key={index}
                                    index={blank}
                                    option={id ? optionById.get(id) : undefined}
                                    disabled={disabled}
                                    onClear={() => clear(blank)}
                                />
                            );
                        })}
                    </code>
                </pre>

                <div className={styles.bank} role='group' aria-label='Blocos'>
                    {options.map((option) => (
                        <Block
                            key={option.id}
                            option={option}
                            used={answer.blanks.includes(option.id)}
                            disabled={disabled}
                            onPlace={() => place(option.id)}
                        />
                    ))}
                </div>
            </div>

            <DragOverlay>
                {dragging && <span className={`${styles.block} ${styles.overlay}`}>{dragging.text}</span>}
            </DragOverlay>
        </DndContext>
    );
}
