import styles from './Toggle.module.scss';

interface ToggleProps {
    name: string;
    label: string;
    options: { value: string; label: string }[];
    defaultValue?: string;
    onChange?: (value: string) => void;
    disabled?: boolean;
}

export default function Toggle({ name, label, options, defaultValue, onChange, disabled }: ToggleProps) {
    return (
        <div
            className={styles.toggle}
            role='radiogroup'
            aria-label={label}
        >
            {options.map(({ value, label: optionLabel }) => (
                <label key={value} className={styles.option}>
                    <input
                        type='radio'
                        name={name}
                        value={value}
                        defaultChecked={value === defaultValue}
                        disabled={disabled}
                        onChange={onChange && (() => onChange(value))}
                    />
                    <span>{optionLabel}</span>
                </label>
            ))}
        </div>
    );
}