import styles from './FormTitle.module.scss';

interface FormTitleProps {
    title: string;
    description?: string;
}

export function FormTitle({ title, description }: FormTitleProps) {
    return (
        <div className={styles.title}>
            <h1>{title}</h1>
            {description && <p>{description}</p>}
        </div>
    );
}