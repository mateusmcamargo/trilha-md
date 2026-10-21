'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import styles from './XpDailyChart.module.scss';

interface XpDailyChartProps {
    // xp earned on each date (YYYY-MM-DD), oldest first, never empty
    data: { date: string; xp: number }[];
}

const shortDate = (date: string) =>
    new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

const tick = { fill: 'var(--color-chart-axis)', fontSize: 12, fontWeight: 700 };

export default function XpDailyChart({ data }: XpDailyChartProps) {
    const last = data[data.length - 1];

    return (
        <figure className={styles.figure}>
            <figcaption className='sr-only'>
                Último XP ganho: {last.xp} em {shortDate(last.date)}, em {data.length} dias com atividade.
            </figcaption>

            <div className={styles.chart} aria-hidden='true'>
                <ResponsiveContainer width='100%' height='100%'>
                    <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                        <CartesianGrid stroke='var(--color-chart-grid)' strokeWidth={2} vertical={false}/>
                        <XAxis
                            dataKey='date'
                            tickFormatter={shortDate}
                            tick={tick}
                            tickLine={false}
                            axisLine={false}
                            minTickGap={24}
                        />
                        <YAxis tick={tick} tickLine={false} axisLine={false} allowDecimals={false}/>
                        <Tooltip
                            labelFormatter={(date) => shortDate(String(date))}
                            formatter={(value) => [`${value} XP`, 'No dia']}
                            contentStyle={{ borderRadius: 10, fontWeight: 700 }}
                        />
                        <Bar dataKey='xp' fill='var(--color-xp)' radius={[6, 6, 0, 0]} maxBarSize={32}/>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </figure>
    );
}
