'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import tooltipStyles from '../Tooltip/Tooltip.module.scss';
import styles from './ContributionCalendar.module.scss';

interface ContributionCalendarProps {
    // activities per day (YYYY-MM-DD)
    days: Record<string, number>;
    // today in São Paulo, from the server: the calendar ends in this week
    today: string;
}

const WEEKS = 26;
const EDGE = 8; // minimum distance from the screen edge, in px

const toDate = (date: string) => new Date(`${date}T12:00:00Z`);
const toKey = (date: Date) => date.toISOString().slice(0, 10);

const level = (count: number) => Math.min(count, 4);

const describe = (date: string, count: number) => {
    const text = toDate(date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', timeZone: 'UTC' });
    if (count === 0) return `Sem atividade em ${text}`;
    return `${count} ${count === 1 ? 'atividade' : 'atividades'} em ${text}`;
};

export default function ContributionCalendar({ days, today }: ContributionCalendarProps) {
    const [bubble, setBubble] = useState<{ text: string; top: number; left: number } | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // starts on the latest weeks
    useEffect(() => {
        const element = scrollRef.current;
        if (element) element.scrollLeft = element.scrollWidth;
    }, []);

    // the bubble is fixed on screen: if anything scrolls or resizes, it would be left floating
    useEffect(() => {
        if (!bubble) return;

        const close = () => setBubble(null);
        document.addEventListener('scroll', close, true);
        window.addEventListener('resize', close);

        return () => {
            document.removeEventListener('scroll', close, true);
            window.removeEventListener('resize', close);
        };
    }, [bubble]);

    // weeks start on Sunday; the last column is the current week
    const end = toDate(today);
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - end.getUTCDay() - (WEEKS - 1) * 7);

    const weeks = Array.from({ length: WEEKS }, (_, week) =>
        Array.from({ length: 7 }, (_, weekday) => {
            const date = new Date(start);
            date.setUTCDate(date.getUTCDate() + week * 7 + weekday);
            const key = toKey(date);
            return { key, count: days[key] ?? 0, future: key > today };
        }),
    );

    // month label on the first week that starts a month
    const monthLabels = weeks.map((week, index) => {
        const first = toDate(week[0].key);
        const previous = index > 0 ? toDate(weeks[index - 1][0].key) : null;
        return !previous || first.getUTCMonth() !== previous.getUTCMonth()
            ? first.toLocaleDateString('pt-BR', { month: 'short', timeZone: 'UTC' }).replace('.', '')
            : '';
    });

    const total = Object.entries(days)
        .filter(([key]) => key >= weeks[0][0].key && key <= today)
        .reduce((sum, [, count]) => sum + count, 0);

    const show = (element: HTMLElement, text: string) => {
        const rect = element.getBoundingClientRect();
        setBubble({ text, top: rect.bottom, left: rect.left + rect.width / 2 });
    };

    // keeps the bubble inside the screen and the arrow pointing at the square
    const placeBubble = (element: HTMLSpanElement | null) => {
        if (!element) return;

        // placeBubble runs again on every render: measure without the previous shift
        element.style.translate = '0px 0';
        const { left, width } = element.getBoundingClientRect();
        const shift = Math.max(EDGE - left, 0) - Math.max(left + width - (window.innerWidth - EDGE), 0);

        element.style.translate = `${shift}px 0`;
        element.style.setProperty('--arrow-shift', `${-shift}px`);
    };

    return (
        <div className={styles.calendar}>
            <p className='sr-only'>
                {total} {total === 1 ? 'atividade' : 'atividades'} nas últimas {WEEKS} semanas.
                Use Tab para percorrer os dias com atividade.
            </p>

            <div className={styles.scroll} ref={scrollRef}>
                <div className={styles.grid} role='group' aria-label={`Calendário de atividades das últimas ${WEEKS} semanas`}>
                    {weeks.map((week, index) => (
                        <div key={week[0].key} className={styles.week}>
                            <span className={styles.month} aria-hidden='true'>{monthLabels[index]}</span>

                            {week.map(({ key, count, future }) => {
                                const text = describe(key, count);

                                return future ? (
                                    <span key={key} className={styles.future} aria-hidden='true'/>
                                ) : (
                                    <span
                                        key={key}
                                        className={`${styles.day} ${styles[`level${level(count)}`]}`}
                                        role='img'
                                        aria-label={text}
                                        tabIndex={count > 0 ? 0 : undefined}
                                        onPointerEnter={(e) => show(e.currentTarget, text)}
                                        onPointerLeave={() => setBubble(null)}
                                        onFocus={(e) => show(e.currentTarget, text)}
                                        onBlur={() => setBubble(null)}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.legend} aria-hidden='true'>
                Menos
                {[0, 1, 2, 3, 4].map((value) => (
                    <span key={value} className={`${styles.day} ${styles[`level${value}`]}`}/>
                ))}
                Mais
            </div>

            {bubble && createPortal(
                <span
                    ref={placeBubble}
                    role='tooltip'
                    className={tooltipStyles.tooltip}
                    style={{ top: bubble.top, left: bubble.left }}
                >
                    {bubble.text}
                </span>,
                document.body,
            )}
        </div>
    );
}
