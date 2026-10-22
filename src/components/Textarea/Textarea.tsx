'use client';

import { useRef } from 'react';

import { HandleBottomRight } from 'lucide-react';

import styles from './Textarea.module.scss';

// same as the Input height (3.6rem + 8px of border)
const MIN_HEIGHT = 44;
const KEY_STEP   = 24;

export function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const drag = useRef<{ startY: number; startHeight: number } | null>(null);

    const getTextarea = () => wrapperRef.current?.querySelector('textarea') ?? null;

    const setHeight = (height: number) => {
        const textarea = getTextarea();
        if (textarea) textarea.style.height = `${Math.max(MIN_HEIGHT, height)}px`;
    };

    const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
        const textarea = getTextarea();
        if (!textarea) return;

        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = { startY: event.clientY, startHeight: textarea.offsetHeight };
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
        if (drag.current) setHeight(drag.current.startHeight + event.clientY - drag.current.startY);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
        const textarea = getTextarea();
        if (!textarea || (event.key !== 'ArrowUp' && event.key !== 'ArrowDown')) return;

        event.preventDefault();
        setHeight(textarea.offsetHeight + (event.key === 'ArrowDown' ? KEY_STEP : -KEY_STEP));
    };

    return (
        <div ref={wrapperRef} className={styles.wrapper}>
            <textarea className={className} {...props}/>

            <button
                type='button'
                className={styles.handle}
                aria-label='Redimensionar o campo de texto'
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={() => { drag.current = null; }}
                onPointerCancel={() => { drag.current = null; }}
                onKeyDown={handleKeyDown}
            >
                <HandleBottomRight aria-hidden='true' strokeWidth={2}/>
            </button>
        </div>
    );
}
