import styles from './Toggle.module.scss';

interface ToggleProps {
    name: string;
    label: string;
    options: { value: string; label: string }[];
    defaultValue?: string;
}

export default function Toggle({ name, label, options, defaultValue }: ToggleProps) {
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
                    />
                    <span>{optionLabel}</span>
                </label>
            ))}
        </div>
    );
}