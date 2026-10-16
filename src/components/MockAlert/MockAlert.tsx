import { FlaskConical, X } from 'lucide-react';

import styles from './MockAlert.module.scss';

interface MockAlertProps {
    onClick: () => void
}

export function MockAlert({onClick}: MockAlertProps) {
    return (
        <div className={styles.mockAlert} aria-label='Modo Demonstração' title='Modo Demonstração'>
            <button
                className={styles.closeButton}
                onClick={() => onClick()}
                aria-label='Fechar aviso de demonstração'
            >
                <X/>
            </button>
            <FlaskConical/>
        </div>
    );
}