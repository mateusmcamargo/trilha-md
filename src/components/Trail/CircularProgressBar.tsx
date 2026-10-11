'use client';

import styles from './CircularProgressBar.module.scss';

interface CircularProgressBarProps {
    progress: number;
    width: number;
    height: number;
    strokeWidth?: number;
    showLabel?: boolean;
    label?: string;
    className?: string;
}

export function CircularProgressBar({
    progress,
    width = 100,
    height = 100,
    strokeWidth = 8,
    showLabel = true,
    className,
}: CircularProgressBarProps) {
    
    const normalizedProgress = Math.min(100, Math.max(0, progress));

    let isCircle = false;

    if (width === height) {isCircle}

    let radius, radiusx, radiusy, circumference, offset, size = width;
    if (isCircle) {
        radius = (size - strokeWidth) / 2;
        circumference = 2 * Math.PI * radius;
        offset = circumference * (1 - normalizedProgress / 100);
    } else {
        radiusx = (width - strokeWidth) / 2;
        radiusy = (height - strokeWidth) / 2;
        circumference = 600;
    }


    if (isCircle) {
        return (
            <div
                className={`${styles.container} ${styles.available}`}
                style={{
                    width: size,
                    height: size,
                }}
            >
                <svg
                    className={styles.svg}
                    width={size}
                    height={size}
                    viewBox={`0 0 ${size} ${size}`}
                    role='progressbar'
                    aria-label='Progresso'
                    aria-valuenow={normalizedProgress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                >
                    <circle
                        className={styles.track}
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        strokeWidth={strokeWidth}
                    />

                    <circle
                        className={styles.progress}
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                    />
                </svg>

                {showLabel && (
                    <span className={styles.label}>
                        {Math.round(normalizedProgress)}%
                    </span>
                )}
            </div>
        )
    }

    return (
        <div
            className={`${styles.container} ${styles.available}`}
            style={{
                width: width,
                height: height,
            }}
        >
            <svg
                className={styles.svg}
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                role='progressbar'
                aria-label='Progresso'
                aria-valuenow={normalizedProgress}
                aria-valuemin={0}
                aria-valuemax={100}
            >
                <ellipse
                    className={styles.track}
                    cx={width / 2}
                    cy={height / 2}
                    rx={radiusx}
                    ry={radiusy}
                    strokeWidth={strokeWidth}
                />

                <ellipse
                    className={styles.progress}
                    cx={width / 2}
                    cy={height / 2}
                    rx={radiusx}
                    ry={radiusy}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                />
            </svg>

            {showLabel && (
                <span className={styles.label}>
                    {Math.round(normalizedProgress)}%
                </span>
            )}
        </div>
    )
}