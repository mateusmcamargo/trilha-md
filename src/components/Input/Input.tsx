import { useId, useRef, useState, useSyncExternalStore } from 'react';
import styles from './Input.module.scss';

import { ChevronDown, ChevronUp, Eye, EyeOff, LucideIcon } from 'lucide-react';
import { HelpTip } from '../HelpTip/HelpTip';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: LucideIcon;
    label?: string;
    help?: string;
}

const PICKER_TYPES = ['date', 'time', 'datetime-local', 'month', 'week'];

// false on the server and during hydration: the browser's own controls show until the custom ones take over
const subscribe = () => () => {};
const useIsClient = () => useSyncExternalStore(subscribe, () => true, () => false);

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
    const inputRef = useRef<HTMLInputElement>(null);

    const generatedId = useId();
    const inputId = id || generatedId;
    const helpId = `${inputId}-help`;
    const hasHelp = !!(help && label);

    const isClient = useIsClient();

    const isPassword = type === 'password';
    const resolvedType = isPassword
        ? (showPassword ? 'text' : 'password')
        : type;

    // without showPicker the browser's own icon is kept, since the custom button couldn't open anything
    const hasPickerButton = isClient && !!type && PICKER_TYPES.includes(type)
        && typeof HTMLInputElement.prototype.showPicker === 'function';
    const hasStepper = isClient && type === 'number';
    const hidesNativeControl = hasPickerButton || hasStepper;

    function openPicker() {
        const input = inputRef.current;
        if (!input) return;

        try {
            input.showPicker();
        } catch {
            input.focus();
        }
    }

    // stepUp/stepDown respect min, max and step; the input event makes React call onChange
    function step(direction: 1 | -1) {
        const input = inputRef.current;
        if (!input) return;

        try {
            if (direction === 1) input.stepUp();
            else input.stepDown();
        } catch {
            return;
        }

        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.focus();
    }

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
                    ref={inputRef}
                    type={resolvedType}
                    required={required}
                    disabled={disabled}
                    className={[
                        styles.input,
                        Icon && styles.withIconLeft,
                        // the picker button sits over the browser's icon, which keeps its place: no extra padding
                        (isPassword || hasStepper) && styles.withIconRight,
                        hidesNativeControl && styles.customControl,
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

                {hasPickerButton && (
                    <button
                        type='button'
                        className={`${styles.iconRight} ${styles.pickerButton}`}
                        onClick={openPicker}
                        aria-label={type === 'time' ? 'Abrir seletor de hora' : 'Abrir calendário'}
                        disabled={disabled}
                    >
                        <ChevronDown strokeWidth={2}/>
                    </button>
                )}

                {/* the arrow keys already work in the input itself, so these buttons skip the tab order */}
                {hasStepper && (
                    <div className={styles.stepper}>
                        <button
                            type='button'
                            tabIndex={-1}
                            onClick={() => step(1)}
                            aria-label='Aumentar valor'
                            disabled={disabled}
                        >
                            <ChevronUp strokeWidth={2.6}/>
                        </button>

                        <button
                            type='button'
                            tabIndex={-1}
                            onClick={() => step(-1)}
                            aria-label='Diminuir valor'
                            disabled={disabled}
                        >
                            <ChevronDown strokeWidth={2.6}/>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
