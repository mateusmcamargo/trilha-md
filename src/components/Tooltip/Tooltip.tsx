'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import styles from './Tooltip.module.scss';

interface TooltipProps {
    id: string;
    text: string;
    children: ReactNode;
}

const EDGE = 8; // minimum distance from the screen edge, in px

// same behavior as HelpTip, but the bubble goes to <body> with position: fixed:
// inside a scrolling container (DataList) an absolute bubble would be clipped
export function Tooltip({ id, text, children }: TooltipProps) {
    const [open, setOpen] = useState<boolean>(false);
    const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

    const buttonRef = useRef<HTMLButtonElement>(null);
    const pointerType = useRef<string>('keyboard');

    useEffect(() => {
        if (!open) return;

        const close = () => setOpen(false);

        // any tap or click outside the button closes it (the button toggles itself)
        const handlePointerDown = (event: PointerEvent) => {
            if (!buttonRef.current?.contains(event.target as Node)) close();
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') close();
        };

        document.addEventListener('pointerdown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);
        // the bubble is fixed on screen: if anything scrolls or resizes, it would be left floating
        document.addEventListener('scroll', close, true);
        window.addEventListener('resize', close);

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('scroll', close, true);
            window.removeEventListener('resize', close);
        };
    }, [open]);

    const show = () => {
        const rect = buttonRef.current?.getBoundingClientRect();
        if (rect) setPosition({ top: rect.bottom, left: rect.left + rect.width / 2 });
        setOpen(true);
    };

    // keeps the bubble inside the screen and the arrow pointing at the button
    const placeBubble = (bubble: HTMLSpanElement | null) => {
        if (!bubble) return;

        const { left, width } = bubble.getBoundingClientRect();
        const shift = Math.max(EDGE - left, 0) - Math.max(left + width - (window.innerWidth - EDGE), 0);

        bubble.style.translate = `${shift}px 0`;
        bubble.style.setProperty('--arrow-shift', `${-shift}px`);
    };

    const handleClick = () => {
        const type = pointerType.current;
        pointerType.current = 'keyboard'; // keyboard click doesn't go through pointerdown

        // mouse: hover already opened it, so the click only keeps it open
        if (type === 'mouse' || !open) show();
        else setOpen(false);
    };

    return (
        <>
            <button
                ref={buttonRef}
                type='button'
                className={styles.trigger}
                aria-label={text}
                aria-expanded={open}
                aria-describedby={open ? id : undefined}
                onPointerDown={(e) => { pointerType.current = e.pointerType; }}
                onPointerEnter={(e) => { if (e.pointerType === 'mouse') show(); }}
                onPointerLeave={(e) => { if (e.pointerType === 'mouse') setOpen(false); }}
                onBlur={() => setOpen(false)}
                onClick={handleClick}
            >
                {children}
            </button>

            {open && createPortal(
                <span
                    id={id}
                    ref={placeBubble}
                    role='tooltip'
                    className={styles.tooltip}
                    style={{ top: position.top, left: position.left }}
                >
                    {text}
                </span>,
                document.body,
            )}
        </>
    );
}
