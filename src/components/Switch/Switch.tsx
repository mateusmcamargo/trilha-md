import styles from './Switch.module.scss';

interface SwitchProps {
    name: string;
    label: string;
    defaultChecked?: boolean;
    onChange?: (checked: boolean) => void;
    disabled?: boolean;
}

export default function Switch({ name, label, defaultChecked, onChange, disabled }: SwitchProps) {
    return (
        <label className={styles.switch}>
            <input
                type='checkbox'
                role='switch'
                name={name}
                defaultChecked={defaultChecked}
                disabled={disabled}
                onChange={onChange && ((event) => onChange(event.target.checked))}
            />
            <span className={styles.track} aria-hidden='true'/>
            <span className={styles.label}>{label}</span>
        </label>
    );
}