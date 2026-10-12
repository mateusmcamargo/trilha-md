import styles from './CodeSandbox.module.scss';

const CODEPEN_USER = 'Mateus-Camargo-the-flexboxer';
const CODEPEN_PEN  = '01a131ac-10fc-7d82-8dc8-91f4e4c9f43d';

const params = new URLSearchParams({
    'default-tab': 'html,result',
    'theme-id': 'dark',
    editable: 'true',
});

const embedUrl = `https://codepen.io/${CODEPEN_USER}/embed/${CODEPEN_PEN}?${params}`;
const penUrl   = `https://codepen.io/${CODEPEN_USER}/pen/${CODEPEN_PEN}`;

export default function CodeSandbox() {
    return (
        <div className={styles.sandbox}>
            <iframe
                className={styles.frame}
                title='Editor de código'
                src={embedUrl}
                loading='lazy'
            />

            <a
                className={styles.link}
                href={penUrl}
                target='_blank'
                rel='noopener noreferrer'
            >
                Abrir no CodePen
            </a>
        </div>
    );
}