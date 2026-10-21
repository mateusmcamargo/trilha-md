'use client';

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import styles from './XpChart.module.scss';

interface XpChartProps {
    // accumulated xp per date (YYYY-MM-DD), oldest first, never empty
    data: { date: string; xp: number }[];
}

const shortDate = (date: string) =>
    new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

const tick = { fill: 'var(--color-chart-axis)', fontSize: 12, fontWeight: 700 };

export default function XpChart({ data }: XpChartProps) {
    const last = data[data.length - 1];

    return (
        <figure className={styles.figure}>
            <figcaption className='sr-only'>
                XP acumulado: {last.xp} em {shortDate(last.date)}, ao longo de {data.length} atividades.
            </figcaption>

            <div className={styles.chart} aria-hidden='true'>
                <ResponsiveContainer width='100%' height='100%'>
                    <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
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
                            formatter={(value) => [`${value} XP`, 'Acumulado']}
                            contentStyle={{ borderRadius: 10, fontWeight: 700 }}
                        />
                        <Area
                            type='monotone'
                            dataKey='xp'
                            stroke='var(--color-xp)'
                            strokeWidth={4}
                            fill='var(--color-xp)'
                            fillOpacity={0.2}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </figure>
    );
}
