import { useId, useState } from 'react';
import styles from './Input.module.scss';

import { Eye, EyeOff, LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: LucideIcon;
    label?: string;
}

export function Input({
    icon: Icon,
    label,
    id,
    className = '',
    type,
    required,
    disabled,
    ...props
}: InputProps) {

    const [showPassword, setShowPassword] = useState(false);

    const generatedId = useId();
    const inputId = id || generatedId;

    const isPassword = type === 'password';
    const resolvedType = isPassword
        ? (showPassword ? 'text' : 'password')
        : type;

    return (
        <div className={`${styles.inputWrapper} ${disabled ? styles.disabled : ''}`}>

            {label &&
                <label htmlFor={inputId}>
                    {label}
                    {required &&
                        <span className={styles.required}>*</span>
                    }
                </label>
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
                    className={`
                        ${styles.input || ''} 
                        ${Icon ? styles.withIconLeft : ''} 
                        ${isPassword ? styles.withIconRight : ''} 
                        ${className}
                    `.trim()}
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