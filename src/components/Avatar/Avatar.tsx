import Image from 'next/image';

import { getInitials } from '#/utils/getInitials';

import styles from './Avatar.module.scss';

interface AvatarProps {
    name: string;
    url: string | null;
    size?: 'sm' | 'md' | 'lg';
}

const pixels = { sm: 24, md: 40, lg: 80 };

// decorative: the name always appears next to it
export default function Avatar({ name, url, size = 'md' }: AvatarProps) {
    return (
        <div className={`${styles.avatar} ${styles[size]}`} aria-hidden='true'>
            {url
                // signed url from the private bucket: served directly, no optimization
                ? <Image src={url} alt='' width={pixels[size]} height={pixels[size]} unoptimized/>
                : <span>{getInitials(name)}</span>
            }
        </div>
    );
}
