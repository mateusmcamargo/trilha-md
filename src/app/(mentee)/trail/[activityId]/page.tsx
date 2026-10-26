import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

import { ArrowLeft, X } from 'lucide-react';

import EventDetail from '#/components/EventDetail/EventDetail';
import PageHeader from '#/components/Header/PageHeader';
import ActivityPlayer from '#/components/minigames/ActivityPlayer/ActivityPlayer';
import { parseItem, type ActivityItem, type ItemSolution } from '#/components/minigames/types';
import { isUuid } from '#/utils/creatorData';
import { getMenteeData } from '#/utils/menteeData';
import { mockActivities, mockActivityItems, mockEvents, mockMaterials } from '#/utils/mockData';
import { isMockMode } from '#/utils/mockMode';
import { isSkeletonPreview } from '#/utils/skeletonPreview';
import { createClient } from '#/utils/supabase/server';

import ActivityLoading from './loading';

export const metadata: Metadata = {
    title: 'Atividade',
};

async function loadActivity(activityId: string) {
    if (isMockMode) {
        const activity = [...mockActivities, ...mockEvents].find((row) => row.id === activityId);
        if (!activity) return null;
        return {
            activity,
            ...(activity.kind === 'remota' ? mockActivityItems(activityId) : { items: [], solutions: undefined }),
            materials: mockMaterials
                .filter((material) => material.activity_id === activityId)
                .map((material) => ({ ...material, signedUrl: null })),
        };
    }

    if (!isUuid(activityId)) return null;

    const supabase = await createClient();

    // RLS: only activities of her editions; materials only after her presence
    const [activity, items, materials] = await Promise.all([
        supabase.from('activities')
            .select('id, title, kind, points, description, starts_at, ends_at, location')
            .eq('id', activityId).maybeSingle(),
        supabase.from('activity_items').select('id, type, content').eq('activity_id', activityId).order('position'),
        supabase.from('activity_materials').select('*').eq('activity_id', activityId)
            .order('position').order('created_at'),
    ]);

    for (const result of [activity, items, materials]) {
        if (result.error) throw new Error(result.error.message);
    }
    if (!activity.data) return null;

    // PDFs live in a private bucket: signed links for one hour
    const paths = materials.data!.flatMap((material) => material.storage_path ?? []);
    const signed = new Map<string, string>();
    if (paths.length) {
        const { data } = await supabase.storage.from('materials').createSignedUrls(paths, 3600);
        data?.forEach(({ path, signedUrl }) => {
            if (path && signedUrl) signed.set(path, signedUrl);
        });
    }

    return {
        activity: activity.data,
        items: items.data!.map(parseItem).filter((item): item is ActivityItem => !!item),
        solutions: undefined as Record<string, ItemSolution> | undefined,
        materials: materials.data!.map((material) => ({
            ...material,
            signedUrl: material.storage_path ? signed.get(material.storage_path) ?? null : null,
        })),
    };
}

export default async function ActivityPage({ params }: { params: Promise<{ activityId: string }> }) {
    // demo mode with the data turned off
    if (await isSkeletonPreview()) return <ActivityLoading/>;

    const { activityId } = await params;
    const [{ trailItems }, data] = await Promise.all([getMenteeData(), loadActivity(activityId)]);

    if (!data) notFound();

    if (data.activity.kind === 'presencial') {
        // events of her trail hang on a node; its status says if she was there
        const branch = trailItems.flatMap((item) => item.branches).find((item) => item.id === activityId);
        if (!branch) notFound();

        return (
            <>
                <PageHeader title='Encontro' action={{ href: '/trail', label: 'Voltar à trilha', icon: ArrowLeft }}/>

                <main className='main-subpage' aria-label={`Encontro ${data.activity.title}`}>
                    <EventDetail event={data.activity} status={branch.status} materials={data.materials}/>
                </main>
            </>
        );
    }

    // a locked node can't be opened by url either
    const node = trailItems.find((item) => item.id === activityId);
    if (!node || node.status === 'locked') redirect('/trail');

    return (
        <>
            <PageHeader
                title={data.activity.title}
                action={{ href: '/trail', label: 'Sair da atividade', icon: X }}
            />

            <main className='main-subpage' aria-label={`Atividade ${data.activity.title}`}>
                <ActivityPlayer
                    activityId={data.activity.id}
                    points={data.activity.points}
                    items={data.items}
                    solutions={data.solutions}
                    backHref='/trail'
                />
            </main>
        </>
    );
}
