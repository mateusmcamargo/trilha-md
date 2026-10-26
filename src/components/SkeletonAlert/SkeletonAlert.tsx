'use client';

import { useId } from 'react';
import { useRouter } from 'next/navigation';

import { HelpTip } from '#/components/HelpTip/HelpTip';
import Switch from '#/components/Switch/Switch';
import { SKELETON_PREVIEW_COOKIE } from '#/utils/mockMode';

import styles from './SkeletonAlert.module.scss';

interface SkeletonAlertProps {
    skeletonPreview: boolean;
}

// demo mode: turns the mock data off to preview the loading skeletons
export function SkeletonAlert({ skeletonPreview }: SkeletonAlertProps) {
    const router = useRouter();
    const helpId = useId();

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
            <HelpTip
                id={helpId}
                label='Dados de exemplo'
                text='Desligue para ver os skeleton loaders: os blocos cinza que aparecem no lugar do conteúdo enquanto ele carrega.'
            />
        </div>
    );
}
