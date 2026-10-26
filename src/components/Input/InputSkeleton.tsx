import Skeleton from '#/components/Skeleton/Skeleton';

import styles from './Input.module.scss';

interface InputSkeletonProps {
    // the label is static text, so it shows for real
    label?: string;
}

// same size as Input: label on top and the field below
export default function InputSkeleton({ label }: InputSkeletonProps) {
    return (
        <div className={styles.inputWrapper} aria-hidden='true'>
            {label
                ? <div className={styles.labelRow}><label>{label}</label></div>
                : <Skeleton width='10rem' height='1.6rem'/>}
            <Skeleton height='4.4rem' radius='1rem'/>
        </div>
    );
}
