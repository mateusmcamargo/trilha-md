'use client';

import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

import styles from './AttendanceChart.module.scss';

interface AttendanceChartProps {
    present: number;
    absent: number;
    justified: number;
    // percentage of present among registered
    rate: number;
}

export default function AttendanceChart({ present, absent, justified, rate }: AttendanceChartProps) {
    const slices = [
        { label: 'Presenças',    value: present,   color: 'var(--color-success)' },
        { label: 'Faltas',       value: absent,    color: 'var(--color-danger)'  },
        { label: 'Justificadas', value: justified, color: 'var(--color-award)'   },
    ];
    const visible = slices.filter((slice) => slice.value > 0);

    return (
        <div className={styles.wrapper}>
            <div className={styles.chart}>
                <div className={styles.ring} aria-hidden='true'>
                    <ResponsiveContainer width='100%' height='100%'>
                        <PieChart>
                            <Pie
                                data={visible}
                                dataKey='value'
                                nameKey='label'
                                innerRadius='65%'
                                outerRadius='100%'
                                stroke='var(--color-surface)'
                                strokeWidth={3}
                                isAnimationActive={false}
                            >
                                {visible.map((slice) => (
                                    <Cell key={slice.label} fill={slice.color}/>
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <strong>{rate}%</strong>
            </div>

            <ul>
                {slices.map((slice) => (
                    <li key={slice.label}>
                        <span style={{ backgroundColor: slice.color }} aria-hidden='true'/>
                        {slice.label}: <strong>{slice.value}</strong>
                    </li>
                ))}
            </ul>
        </div>
    );
}
