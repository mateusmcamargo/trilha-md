'use client';

import { useEffect, useRef, useState } from 'react';

import { CircleHelp } from 'lucide-react';

import styles from './HelpTip.module.scss';

interface HelpTipProps {
    id: string;
    label: string;
    text: string;
}

// the tooltip anchors to the nearest positioned parent (in Input, the .labelRow),
// so it takes the field width and never overflows the screen on mobile
export function HelpTip({ id, label, text }: HelpTipProps) {
    const [open, setOpen] = useState<boolean>(false);

    const buttonRef = useRef<HTMLButtonElement>(null);
    const pointerType = useRef<string>('keyboard');

    useEffect(() => {
        if (!open) return;

        // any tap or click outside the button closes it (the button toggles itself)
        const handlePointerDown = (event: PointerEvent) => {
            if (!buttonRef.current?.contains(event.target as Node)) setOpen(false);
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setOpen(false);
        };

        document.addEventListener('pointerdown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [open]);

    const handleClick = () => {
        const type = pointerType.current;
        pointerType.current = 'keyboard'; // keyboard click doesn't go through pointerdown

        // mouse: hover already opened it, so the click only keeps it open
        setOpen((prev) => type === 'mouse' ? true : !prev);
    };

    return (
        <span className={styles.helpTip}>
            <button
                ref={buttonRef}
                type='button'
                className={styles.button}
                aria-label={`Ajuda: ${label}`}
                aria-expanded={open}
                aria-controls={id}
                onPointerDown={(e) => { pointerType.current = e.pointerType; }}
                onPointerEnter={(e) => { if (e.pointerType === 'mouse') setOpen(true); }}
                onPointerLeave={(e) => { if (e.pointerType === 'mouse') setOpen(false); }}
                onBlur={() => setOpen(false)}
                onClick={handleClick}
            >
                <CircleHelp aria-hidden='true'/>
            </button>

            <span
                id={id}
                role='tooltip'
                className={`${styles.tooltip} ${open ? styles.open : ''}`}
            >
                {text}
            </span>
        </span>
    );
}