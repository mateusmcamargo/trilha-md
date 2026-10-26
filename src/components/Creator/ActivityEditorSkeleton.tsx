import InputSkeleton from '#/components/Input/InputSkeleton';
import Skeleton from '#/components/Skeleton/Skeleton';

import styles from './ActivityEditor.module.scss';

// same layout as ActivityEditor: details form and the list of items
export default function ActivityEditorSkeleton() {
    return (
        <>
            <section className={styles.section} aria-hidden='true'>
                <h2>Dados da atividade</h2>

                <form className={styles.details}>
                    <InputSkeleton label='Título'/>
                    <InputSkeleton label='XP máximo'/>
                    <Skeleton height='4.4rem' radius='1rem'/>
                </form>
            </section>

            <section className={styles.section} aria-hidden='true'>
                <Skeleton width='10rem' height='2.4rem'/>

                <ol className={styles.items}>
                    {[0, 1].map((index) => (
                        <li key={index} className={styles.item}>
                            <div className={styles.itemInfo}>
                                <Skeleton width='3.2rem' height='3.2rem' radius='50%'/>
                                <Skeleton width='70%' height='3.6rem'/>
                            </div>
                            <Skeleton height='8rem' radius='1rem'/>
                            <div className={styles.itemActions}>
                                <Skeleton width='4rem' height='4rem' radius='1rem'/>
                                <Skeleton width='4rem' height='4rem' radius='1rem'/>
                                <Skeleton width='4rem' height='4rem' radius='1rem'/>
                                <Skeleton width='4rem' height='4rem' radius='1rem'/>
                            </div>
                        </li>
                    ))}
                </ol>
            </section>
        </>
    );
}
