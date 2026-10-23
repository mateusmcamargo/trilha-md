'use client';

import { useRouter } from 'next/navigation';

import Switch from '#/components/Switch/Switch';
import { SKELETON_PREVIEW_COOKIE } from '#/utils/mockMode';

import styles from './SkeletonAlert.module.scss';

interface SkeletonAlertProps {
    skeletonPreview: boolean;
}

// demo mode: turns the mock data off to preview the loading skeletons
export function SkeletonAlert({ skeletonPreview }: SkeletonAlertProps) {
    const router = useRouter();

    const toggle = (showData: boolean) => {
        document.cookie = `${SKELETON_PREVIEW_COOKIE}=${!showData}; path=/; samesite=lax`;
        router.refresh();
    };

    return (
        <div className={styles.skeletonAlert}>
            <Switch
                name='mockData'
                label='Dados de exemplo'
                defaultChecked={!skeletonPreview}
                onChange={toggle}
            />
        </div>
    );
}
