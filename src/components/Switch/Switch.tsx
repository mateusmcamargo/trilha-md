import styles from './Switch.module.scss';

interface SwitchProps {
    name: string;
    label: string;
    defaultChecked?: boolean;
}

export default function Switch({ name, label, defaultChecked }: SwitchProps) {
    return (
        <label className={styles.switch}>
            <input
                type='checkbox'
                role='switch'
                name={name}
                defaultChecked={defaultChecked}
            />
            <span className={styles.track} aria-hidden='true'/>
            <span className={styles.label}>{label}</span>
        </label>
    );
}