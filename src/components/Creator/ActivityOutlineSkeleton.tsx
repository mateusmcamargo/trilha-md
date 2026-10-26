import Skeleton from '#/components/Skeleton/Skeleton';

import styles from './ActivityOutline.module.scss';

// same layout as ActivityOutline: edition picker and the list of activities
export default function ActivityOutlineSkeleton() {
    return (
        <div className={styles.outline} aria-hidden='true'>
            <div className={styles.picker}>
                <label>Edição</label>
                <Skeleton height='4.4rem' radius='1rem'/>
            </div>

            <section className={styles.section}>
                <Skeleton width='24rem' height='2.4rem'/>

                <ol className={styles.list}>
                    {[0, 1, 2, 3].map((index) => (
                        <li key={index} className={styles.activity}>
                            <div className={styles.main}>
                                <Skeleton width='3.2rem' height='3.2rem' radius='50%'/>

                                <div className={styles.info}>
                                    <Skeleton width='80%' height='1.8rem'/>
                                    <Skeleton width='50%' height='1.4rem'/>
                                </div>

                                <div className={styles.actions}>
                                    <Skeleton width='4rem' height='4rem' radius='1rem'/>
                                    <Skeleton width='4rem' height='4rem' radius='1rem'/>
                                    <Skeleton width='4rem' height='4rem' radius='1rem'/>
                                </div>
                            </div>
                        </li>
                    ))}
                </ol>

                <Skeleton height='4.4rem' radius='1rem'/>
            </section>
        </div>
    );
}
