import Skeleton from '#/components/Skeleton/Skeleton';

import styles from './CommunitySection.module.scss';

// same layout as CommunitySection: title, tabs and a few people
export default function CommunitySectionSkeleton() {
    return (
        <section className={styles.people} aria-hidden='true'>
            <div className={styles.header}>
                <h2>Comunidade</h2>
                <Skeleton width='14rem' height='1.6rem'/>
            </div>

            <div className={styles.box}>
                <Skeleton height='4.8rem' radius='0'/>

                <ul className={styles.list}>
                    {[0, 1, 2].map((index) => (
                        <li key={index} className={styles.person}>
                            <Skeleton width='4rem' height='4rem' radius='50%'/>
                            <div className={styles.details}>
                                <Skeleton width='60%' height='1.8rem'/>
                                <Skeleton width='5rem' height='1.4rem'/>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
