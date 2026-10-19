import { useId, useState } from 'react';
import styles from './Input.module.scss';

import { Eye, EyeOff, LucideIcon } from 'lucide-react';
import { HelpTip } from '../HelpTip/HelpTip';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: LucideIcon;
    label?: string;
    help?: string;
}

export function Input({
    icon: Icon,
    label,
    help,
    id,
    className = '',
    type,
    required,
    disabled,
    'aria-describedby': describedBy,
    ...props
}: InputProps) {

    const [showPassword, setShowPassword] = useState(false);

    const generatedId = useId();
    const inputId = id || generatedId;
    const helpId = `${inputId}-help`;
    const hasHelp = !!(help && label);

    const isPassword = type === 'password';
    const resolvedType = isPassword
        ? (showPassword ? 'text' : 'password')
        : type;

    return (
        <div className={styles.inputWrapper}>

            {label &&
                <div className={styles.labelRow}>
                    <label htmlFor={inputId}>
                        {label}
                        {required &&
                            <span className={styles.required} aria-hidden='true'>*</span>
                        }
                    </label>

                    {hasHelp && <HelpTip id={helpId} label={label} text={help}/>}
                </div>
            }

            <div className={styles.inputContainer}>
                {Icon && 
                    <span className={styles.iconLeft} aria-hidden="true">
                        <Icon strokeWidth={2}/>
                    </span>
                }

                <input
                    id={inputId}
                    type={resolvedType}
                    required={required}
                    disabled={disabled}
                    className={[
                        styles.input,
                        Icon && styles.withIconLeft,
                        isPassword && styles.withIconRight,
                        className,
                    ].filter(Boolean).join(' ')}
                    aria-describedby={[describedBy, hasHelp ? helpId : undefined].filter(Boolean).join(' ') || undefined}
                    {...props}
                />

                {isPassword && (
                    <button
                        type='button'
                        className={styles.iconRight}
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                        disabled={disabled}
                    >
                        {showPassword ? (
                            <EyeOff strokeWidth={2}/>
                        ) : (
                            <Eye strokeWidth={2}/>
                        )}
                    </button>
                )}
            </div>
        </div>      
    );
}