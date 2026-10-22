import { cache } from 'react';

import { parseItem, type ActivityItem, type ItemSolution } from '#/components/minigames/types';
import type { Tables } from '#/types/database';

import { mockActivities, mockActivityItems, mockEditions, mockEvents, mockMaterials } from './mockData';
import { isMockMode } from './mockMode';
import { createClient } from './supabase/server';

export const isUuid = (value: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

export type CreatorEdition = Pick<Tables<'editions'>, 'id' | 'name' | 'status'>;

type ActivityRow = Pick<Tables<'activities'>,
    'id' | 'title' | 'kind' | 'position' | 'parent_id' | 'starts_at' | 'points'>;

export interface OutlineActivity {
    id: string;
    title: string;
    position: number;
    points: number;
    itemCount: number;
    branches: { id: string; title: string; startsAt: string }[];
}

// remote activities in trail order, each with its in-person branches
function buildOutline(rows: (ActivityRow & { itemCount: number })[]): OutlineActivity[] {
    return rows
        .filter((row) => row.kind === 'remota')
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        .map((row, index) => ({
            id: row.id,
            title: row.title,
            position: index + 1,
            points: row.points,
            itemCount: row.itemCount,
            branches: rows
                .filter((event) => event.kind === 'presencial' && event.parent_id === row.id && event.starts_at)
                .sort((a, b) => a.starts_at!.localeCompare(b.starts_at!))
                .map((event) => ({ id: event.id, title: event.title, startsAt: event.starts_at! })),
        }));
}

// editions a mentor can create activities in (active ones first)
export const getCreatorEditions = cache(async (): Promise<CreatorEdition[]> => {
    if (isMockMode) return mockEditions;

    const supabase = await createClient();
    const { data, error } = await supabase
        .from('editions').select('id, name, status')
        .neq('status', 'completed')
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return [...data].sort((a, b) => Number(b.status === 'active') - Number(a.status === 'active'));
});

export const getEditionOutline = cache(async (editionId: string) => {
    if (isMockMode) {
        return buildOutline([...mockActivities, ...mockEvents]
            .filter((row) => row.edition_id === editionId)
            .map((row) => ({ ...row, itemCount: row.kind === 'remota' ? 5 : 0 })));
    }

    const supabase = await createClient();
    const { data, error } = await supabase
        .from('activities')
        .select('id, title, kind, position, parent_id, starts_at, points, activity_items(count)')
        .eq('edition_id', editionId);

    if (error) throw new Error(error.message);
    return buildOutline(data.map(({ activity_items, ...row }) => ({
        ...row,
        itemCount: activity_items[0]?.count ?? 0,
    })));
});

export interface EditableActivity {
    activity: Pick<Tables<'activities'>, 'id' | 'edition_id' | 'title' | 'kind' | 'points'>;
    items: ActivityItem[];
    solutions: Record<string, ItemSolution>;
    // in-person activities hanging on it: it can't be deleted while they exist
    branchCount: number;
}

// a remote activity with its items and answer key (mentors read the solutions)
export const getEditableActivity = cache(async (activityId: string): Promise<EditableActivity | null> => {
    if (isMockMode) {
        const activity = mockActivities.find((row) => row.id === activityId);
        if (!activity) return null;
        return {
            activity,
            ...mockActivityItems(activityId),
            branchCount: mockEvents.filter((event) => event.parent_id === activityId).length,
        };
    }

    const supabase = await createClient();

    const [activity, items, branches] = await Promise.all([
        supabase.from('activities').select('id, edition_id, title, kind, points').eq('id', activityId).maybeSingle(),
        supabase.from('activity_items')
            .select('id, type, content, activity_item_solutions(solution, explanation)')
            .eq('activity_id', activityId).order('position'),
        supabase.from('activities').select('id', { count: 'exact', head: true }).eq('parent_id', activityId),
    ]);

    for (const result of [activity, items, branches]) {
        if (result.error) throw new Error(result.error.message);
    }
    if (!activity.data || activity.data.kind !== 'remota') return null;

    const solutions: Record<string, ItemSolution> = {};
    items.data!.forEach((row) => {
        const key = row.activity_item_solutions;
        if (key) {
            solutions[row.id] = {
                solution: key.solution as unknown as ItemSolution['solution'],
                explanation: key.explanation,
            };
        }
    });

    return {
        activity: activity.data,
        items: items.data!.map(parseItem).filter((item): item is ActivityItem => !!item),
        solutions,
        branchCount: branches.count ?? 0,
    };
});

export type EventRow = Pick<Tables<'activities'>,
    'id' | 'edition_id' | 'title' | 'description' | 'starts_at' | 'ends_at' | 'location' | 'points' | 'parent_id'>;

export type Material = Tables<'activity_materials'>;

// remote activities an in-person one can hang on, in trail order ("3. Lógica")
export const getParentOptions = cache(async (editionId: string) => {
    const outline = await getEditionOutline(editionId);
    return outline.map((activity) => ({ id: activity.id, label: `${activity.position}. ${activity.title}` }));
});

export interface EditableEvent {
    event: EventRow;
    materials: Material[];
    parents: Awaited<ReturnType<typeof getParentOptions>>;
}

export const getEditableEvent = cache(async (activityId: string): Promise<EditableEvent | null> => {
    if (isMockMode) {
        const event = mockEvents.find((row) => row.id === activityId);
        if (!event) return null;
        return {
            event,
            materials: mockMaterials.filter((material) => material.activity_id === activityId),
            parents: await getParentOptions(event.edition_id),
        };
    }

    const supabase = await createClient();

    const [event, materials] = await Promise.all([
        supabase.from('activities')
            .select('id, edition_id, title, description, starts_at, ends_at, location, points, parent_id, kind')
            .eq('id', activityId).maybeSingle(),
        supabase.from('activity_materials').select('*').eq('activity_id', activityId)
            .order('position').order('created_at'),
    ]);

    if (event.error) throw new Error(event.error.message);
    if (materials.error) throw new Error(materials.error.message);
    if (!event.data || event.data.kind !== 'presencial') return null;

    return {
        event: event.data,
        materials: materials.data,
        parents: await getParentOptions(event.data.edition_id),
    };
});

// kind of a creator url: remote editor or in-person form
export const getActivityKind = cache(async (activityId: string) => {
    if (isMockMode) {
        return [...mockActivities, ...mockEvents].find((row) => row.id === activityId)?.kind ?? null;
    }

    // a broken url would be a database error, not "not found"
    if (!isUuid(activityId)) return null;

    const supabase = await createClient();
    const { data, error } = await supabase.from('activities').select('kind').eq('id', activityId).maybeSingle();
    if (error) throw new Error(error.message);
    return data?.kind ?? null;
});
