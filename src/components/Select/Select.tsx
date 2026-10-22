'use client';

import { useEffect, useId, useRef, useState } from 'react';

import { Check, ChevronDown } from 'lucide-react';

import styles from './Select.module.scss';

export interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps {
    id?: string;
    options: SelectOption[];
    value: string;
    onChange: (value: string) => void;
    // shown while no option is selected
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    'aria-invalid'?: boolean;
    'aria-describedby'?: string;
}

// space the list needs below the button before it opens upwards instead
const LIST_SPACE = 260;
// time between key presses that still count as the same search ("ba" -> "Banana")
const TYPEAHEAD_MS = 600;

export function Select({
    id,
    options,
    value,
    onChange,
    placeholder = 'Selecione',
    required,
    disabled,
    'aria-invalid': invalid,
    'aria-describedby': describedBy,
}: SelectProps) {
    const generatedId = useId();
    const listId = `${generatedId}-list`;
    const optionId = (index: number) => `${generatedId}-option-${index}`;

    const buttonRef = useRef<HTMLButtonElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const search = useRef({ text: '', time: 0 });

    const [open,    setOpen]    = useState(false);
    const [openUp,  setOpenUp]  = useState(false);
    const [active,  setActive]  = useState(0);

    const selectedIndex = options.findIndex((option) => option.value === value);
    const selected = options[selectedIndex];

    useEffect(() => {
        if (open) listRef.current?.children[active]?.scrollIntoView({ block: 'nearest' });
    }, [open, active]);

    function show() {
        const rect = buttonRef.current?.getBoundingClientRect();
        if (rect) {
            const spaceBelow = window.innerHeight - rect.bottom;
            setOpenUp(spaceBelow < LIST_SPACE && rect.top > spaceBelow);
        }

        setActive(Math.max(selectedIndex, 0));
        setOpen(true);
    }

    function choose(index: number) {
        const option = options[index];
        if (option) onChange(option.value);
        setOpen(false);
    }

    function handleTypeahead(key: string) {
        const now = Date.now();
        const text = (now - search.current.time > TYPEAHEAD_MS ? '' : search.current.text) + key.toLowerCase();
        search.current = { text, time: now };

        // same letter repeated cycles through the options that start with it
        const start = text.length === 1 ? active + 1 : active;
        const ordered = Array.from({ length: options.length }, (_, offset) => (start + offset) % options.length);
        const found = ordered.find((index) => options[index].label.toLowerCase().startsWith(text));

        if (found === undefined) return;
        if (!open) show();
        setActive(found);
    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
        if (!options.length) return;

        if (!open) {
            if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
                event.preventDefault();
                show();
            } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
                handleTypeahead(event.key);
            }
            return;
        }

        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                setActive(Math.min(active + 1, options.length - 1));
                break;
            case 'ArrowUp':
                event.preventDefault();
                setActive(Math.max(active - 1, 0));
                break;
            case 'Home':
                event.preventDefault();
                setActive(0);
                break;
            case 'End':
                event.preventDefault();
                setActive(options.length - 1);
                break;
            case 'Enter':
            case ' ':
                event.preventDefault();
                choose(active);
                break;
            case 'Escape':
                // keeps an Escape that only closes the list from also closing a modal around it
                event.preventDefault();
                event.stopPropagation();
                setOpen(false);
                break;
            case 'Tab':
                setOpen(false);
                break;
            default:
                if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
                    handleTypeahead(event.key);
                }
        }
    }

    return (
        <div
            className={styles.wrapper}
            onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
            }}
        >
            <button
                ref={buttonRef}
                id={id}
                type='button'
                role='combobox'
                className={styles.trigger}
                aria-haspopup='listbox'
                aria-expanded={open}
                aria-controls={open ? listId : undefined}
                aria-activedescendant={open ? optionId(active) : undefined}
                aria-required={required || undefined}
                aria-invalid={invalid}
                aria-describedby={describedBy}
                disabled={disabled}
                onClick={() => (open ? setOpen(false) : show())}
                onKeyDown={handleKeyDown}
            >
                <span className={selected ? styles.value : styles.placeholder}>
                    {selected ? selected.label : placeholder}
                </span>

                <ChevronDown aria-hidden='true' strokeWidth={2.6}/>
            </button>

            {open && (
                <ul
                    ref={listRef}
                    id={listId}
                    role='listbox'
                    className={[styles.list, openUp && styles.up].filter(Boolean).join(' ')}
                >
                    {options.map((option, index) => (
                        <li
                            key={option.value}
                            id={optionId(index)}
                            role='option'
                            aria-selected={index === selectedIndex}
                            className={index === active ? styles.active : undefined}
                            // keeps the focus on the button, so the list isn't closed by the blur
                            onMouseDown={(event) => event.preventDefault()}
                            onMouseMove={() => setActive(index)}
                            onClick={() => choose(index)}
                        >
                            <span>{option.label}</span>
                            {index === selectedIndex && <Check aria-hidden='true' strokeWidth={3}/>}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
