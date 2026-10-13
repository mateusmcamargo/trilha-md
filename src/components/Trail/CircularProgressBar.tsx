'use client';

import styles from './CircularProgressBar.module.scss';

interface CircularProgressBarProps {
    progress: number;
    width?: number;
    height?: number;
    strokeWidth?: number;
    showLabel?: boolean;
    label?: string;
    decorative?: boolean;
    className?: string;
}

export function CircularProgressBar({
    progress,
    width = 100,
    height = 100,
    strokeWidth = 8,
    showLabel = true,
    label = 'Progresso',
    decorative = false,
}: CircularProgressBarProps) {
    const normalizedProgress = Math.min(100, Math.max(0, progress));

    const rx = (width - strokeWidth) / 2;
    const ry = (height - strokeWidth) / 2;

    return (
        <div
            className={`${styles.container} ${styles.available}`}
            style={{ width, height }}
            aria-hidden={decorative || undefined}
        >
            <svg
                className={styles.svg}
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                focusable='false'
                {...(!decorative && {
                    role: 'progressbar',
                    'aria-label': label,
                    'aria-valuenow': normalizedProgress,
                    'aria-valuemin': 0,
                    'aria-valuemax': 100,
                })}
            >
                <ellipse
                    className={styles.track}
                    cx={width / 2}
                    cy={height / 2}
                    rx={rx}
                    ry={ry}
                    strokeWidth={strokeWidth}
                />

                <ellipse
                    className={styles.progress}
                    cx={width / 2}
                    cy={height / 2}
                    rx={rx}
                    ry={ry}
                    strokeWidth={strokeWidth}
                    pathLength={100}
                    strokeDasharray={100}
                    strokeDashoffset={100 - normalizedProgress}
                />
            </svg>

            {showLabel && (
                <span className={styles.label}>
                    {Math.round(normalizedProgress)}%
                </span>
            )}
        </div>
    );
}