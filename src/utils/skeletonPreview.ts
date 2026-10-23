import { cookies } from 'next/headers';

import { isMockMode, SKELETON_PREVIEW_COOKIE } from './mockMode';

// demo mode: the SkeletonAlert switch turned the data off
export async function isSkeletonPreview() {
    if (!isMockMode) return false;
    const cookieStore = await cookies();
    return cookieStore.get(SKELETON_PREVIEW_COOKIE)?.value === 'true';
}
