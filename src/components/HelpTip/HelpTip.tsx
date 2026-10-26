'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { CircleHelp } from 'lucide-react';

import styles from './HelpTip.module.scss';

interface HelpTipProps {
    id: string;
    label: string;
    text: string;
}

const GAP = 1.2; // button to bubble, in rem (room for the arrow)
// minimum distance from the arrow center to the bubble sides, in rem: the corner radius (1)
// plus the arrow half diagonal (.7), so its borders never end over the rounded corner
const ARROW_INSET = 2;

// the tooltip takes the width of the nearest positioned parent (in Input, the .labelRow),
// so it never overflows the screen on mobile. Its height and the arrow are measured from
// the button: it opens below, or above when there is no room below
export function HelpTip({ id, label, text }: HelpTipProps) {
    const [open, setOpen] = useState<boolean>(false);

    const buttonRef = useRef<HTMLButtonElement>(null);
    const tooltipRef = useRef<HTMLSpanElement>(null);
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

    useLayoutEffect(() => {
        const button = buttonRef.current;
        const tooltip = tooltipRef.current;
        const parent = tooltip?.offsetParent;
        if (!open || !button || !tooltip || !parent) return;

        const place = () => {
            const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
            const buttonRect = button.getBoundingClientRect();
            const parentRect = parent.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();

            const gap = GAP * rem;
            const spaceBelow = window.innerHeight - buttonRect.bottom;
            const above = spaceBelow < tooltipRect.height + gap && buttonRect.top > spaceBelow;

            // absolute coordinates are relative to the parent's padding box
            const parentTop = parentRect.top + parent.clientTop;
            tooltip.style.top = `${above
                ? buttonRect.top - parentTop - gap - tooltipRect.height
                : buttonRect.bottom - parentTop + gap}px`;
            tooltip.dataset.side = above ? 'above' : 'below';

            const width = tooltip.clientWidth;
            const inset = Math.min(ARROW_INSET * rem, width / 2);
            // the arrow's left is relative to the padding box, so the border is discounted
            const center = buttonRect.left + buttonRect.width / 2 - tooltipRect.left - tooltip.clientLeft;
            tooltip.style.setProperty(
                '--arrow-x',
                `${Math.min(Math.max(center, inset), width - inset)}px`,
            );
        };

        place();
        window.addEventListener('resize', place);
        return () => window.removeEventListener('resize', place);
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
                ref={tooltipRef}
                role='tooltip'
                className={`${styles.tooltip} ${open ? styles.open : ''}`}
            >
                {text}
            </span>
        </span>
    );
}