import Skeleton from '#/components/Skeleton/Skeleton';

import styles from './CheckinScreen.module.scss';

// same layout as CheckinScreen: title, QR Code, link, button and the confirmed list
export default function CheckinScreenSkeleton() {
    return (
        <div className={styles.screen} aria-hidden='true'>
            <Skeleton width='70%' height='2.4rem'/>

            <div className={styles.qr}>
                <Skeleton height='100%' radius='1rem'/>
            </div>

            <div className={styles.code}>
                <Skeleton width='18rem' height='1.4rem'/>
                <Skeleton width='24rem' height='1.4rem'/>
            </div>

            <Skeleton height='4.4rem' radius='1rem'/>

            <section className={styles.checkins}>
                <Skeleton width='26rem' height='2rem'/>
                <Skeleton height='1.6rem'/>
                <Skeleton height='1.6rem'/>
            </section>
        </div>
    );
}
