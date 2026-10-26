import Skeleton from '#/components/Skeleton/Skeleton';

import playerStyles from '#/components/minigames/CompleteCode/CompleteCodePlayer.module.scss';
import styles from './ActivityPlayer.module.scss';

// same layout as ActivityPlayer with a CompleteCode item: progress, instruction, code and blocks
export default function ActivityPlayerSkeleton() {
    return (
        <div className={styles.activity} aria-hidden='true'>
            <div className={styles.track}/>

            <Skeleton width='8rem' height='1.4rem'/>

            <div className={playerStyles.player}>
                <Skeleton width='85%' height='2.4rem'/>
                <Skeleton height='16rem' radius='1rem'/>

                <div className={playerStyles.bank}>
                    {['8rem', '6rem', '10rem', '7rem'].map((width, index) => (
                        <Skeleton key={index} width={width} height='4.8rem' radius='1.2rem'/>
                    ))}
                </div>
            </div>

            <div className={styles.footer}>
                <Skeleton height='4.4rem' radius='1rem'/>
            </div>
        </div>
    );
}
