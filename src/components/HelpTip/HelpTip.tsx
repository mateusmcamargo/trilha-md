'use client';

import { useEffect, useRef, useState } from 'react';

import { CircleHelp } from 'lucide-react';

import styles from './HelpTip.module.scss';

interface HelpTipProps {
    id: string;
    label: string;
    text: string;
}

// O tooltip se ancora no pai posicionado mais próximo (no Input, a .labelRow),
// por isso ocupa a largura do campo e nunca estoura a tela no celular.
export function HelpTip({ id, label, text }: HelpTipProps) {
    const [open, setOpen] = useState<boolean>(false);

    const buttonRef = useRef<HTMLButtonElement>(null);
    const pointerType = useRef<string>('keyboard');

    useEffect(() => {
        if (!open) return;

        // qualquer toque ou clique fora do botão fecha (o botão alterna sozinho)
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
        pointerType.current = 'keyboard'; // clique de teclado não passa por pointerdown

        // mouse: o hover já abriu, então o clique só mantém aberto
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