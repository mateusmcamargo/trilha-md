import Link from 'next/link';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

import type { LucideIcon } from 'lucide-react';

import PressableBase from '../PressableBase/PressableBase';

import styles from './Button.module.scss';

type ButtonVariant = 'brand' | 'danger' | 'neutral' | 'outline';

interface ButtonBaseProps {
    variant?: ButtonVariant;
    icon?: LucideIcon;
    fullWidth?: boolean;
    depth?: number;
}

// without text the button is square, so it needs a name for screen readers
type ButtonContent =
    | { children: ReactNode; 'aria-label'?: string }
    | { children?: undefined; 'aria-label': string };

type ButtonAsButton = ButtonBaseProps & ButtonContent
    & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & { href?: undefined };

type ButtonAsLink = ButtonBaseProps & ButtonContent
    & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children' | 'href'> & { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button({
    variant = 'neutral',
    icon: Icon,
    fullWidth = false,
    depth,
    children,
    ...props
}: ButtonProps) {
    const iconOnly = children === undefined;
    const className = [
        styles.button,
        iconOnly && styles.square,
        fullWidth && styles.full,
    ].filter(Boolean).join(' ');

    const label = props['aria-label'];
    const content = (
        <>
            {Icon && <Icon aria-hidden='true'/>}
            {children}
        </>
    );

    return (
        <PressableBase
            color='var(--button-border)'
            depth={depth}
            radius='1rem'
            className={`${styles.wrapper} ${styles[variant]} ${fullWidth ? styles.wrapperFull : ''}`}
        >
            {props.href !== undefined ? (
                <Link
                    {...(props as ButtonAsLink)}
                    className={className}
                    title={iconOnly ? label : undefined}
                >
                    {content}
                </Link>
            ) : (
                <button
                    type='button'
                    {...(props as ButtonAsButton)}
                    className={className}
                    title={iconOnly ? label : undefined}
                >
                    {content}
                </button>
            )}
        </PressableBase>
    );
}
