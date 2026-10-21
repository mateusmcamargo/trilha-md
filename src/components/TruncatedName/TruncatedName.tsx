'use client';

import { useEffect, useId, useRef, useState } from 'react';

import { Tooltip } from '../Tooltip/Tooltip';

import styles from './TruncatedName.module.scss';

interface TruncatedNameProps {
    // text shown (may be only the first name)
    children: string;
    // full name, shown in the tooltip when the text is cut with '...'
    fullName: string;
}

// the parent must let it shrink (min-width: 0 up to the table cell, see Column.shrink)
export default function TruncatedName({ children, fullName }: TruncatedNameProps) {
    const id = useId();
    const boxRef = useRef<HTMLSpanElement>(null);
    const [truncated, setTruncated] = useState(false);

    // observing already runs the first measurement; resizing the screen or the other columns measures again
    useEffect(() => {
        const box = boxRef.current;
        if (!box) return;

        const observer = new ResizeObserver(() => {
            const text = box.querySelector('span');
            if (text) setTruncated(text.scrollWidth > text.clientWidth);
        });

        observer.observe(box);
        return () => observer.disconnect();
    }, [children]);

    const text = <span className={styles.text}>{children}</span>;

    return (
        <span ref={boxRef} className={styles.box}>
            {truncated ? <Tooltip id={id} text={fullName}>{text}</Tooltip> : text}
        </span>
    );
}
