import InputSkeleton from '#/components/Input/InputSkeleton';
import Skeleton from '#/components/Skeleton/Skeleton';

import styles from './EventForm.module.scss';

// same layout as EventForm: title, description, date and time, place, XP and node
export default function EventFormSkeleton() {
    return (
        <form className={styles.form} aria-hidden='true'>
            <InputSkeleton label='Título'/>

            <div className={styles.field}>
                <label>Descrição</label>
                <Skeleton height='12rem' radius='1rem'/>
            </div>

            <InputSkeleton label='Data'/>

            <div className={styles.row}>
                <div><InputSkeleton label='Início'/></div>
                <div><InputSkeleton label='Fim'/></div>
            </div>

            <InputSkeleton label='Local'/>
            <InputSkeleton label='XP da presença'/>
            <InputSkeleton label='Atividade à distância relacionada'/>

            <Skeleton height='4.4rem' radius='1rem'/>
        </form>
    );
}
