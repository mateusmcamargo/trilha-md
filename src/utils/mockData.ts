import type { Tables } from '#/types/database';

import { todayInSaoPaulo } from './dates';
import type { MenteeRows } from './menteeData';
import type { DashboardInput } from './dashboardData';
import type { MenteeRow, XpRow } from './teamData';

// demo mode data, same format as database (src/types/database.ts)
const profileId = 'mock-profile-anne';
const mentorId  = 'mock-profile-maria';
const editionId = 'mock-edition-dandelion';
const createdAt = '2026-10-01T12:00:00Z';

const profile: Tables<'profiles'> = {
    id:         profileId,
    role:       'mentee',
    full_name:  'Anne Franco',
    username:   'anne.franco26',
    avatar_url: null,
    deleted_at: null,
    created_at: createdAt,
};

export const mentorProfile: Tables<'profiles'> = {
    id:         mentorId,
    role:       'mentor',
    full_name:  'Maria da Silva',
    username:   'maria',
    avatar_url: null,
    deleted_at: null,
    created_at: createdAt,
};

const edition: Tables<'editions'> = {
    id:          editionId,
    name:        'Dandelion',
    subtitle:    'Como a internet funciona',
    access_code: 'DEMO',
    start_date:  '2026-10-01',
    end_date:    null,
    status:      'active',
    created_by:  mentorId,
    created_at:  createdAt,
};

const enrollment: Tables<'enrollments'> & { editions: Tables<'editions'> } = {
    id:          'mock-enrollment-1',
    edition_id:  editionId,
    mentee_id:   profileId,
    mentor_id:   mentorId,
    team_id:     null,
    status:      'active',
    enrolled_at: createdAt,
    editions:    edition,
};

const titles = [
    'Boas-vindas',
    'Tecnologia',
    'Programação',
    'Web',
    'Projeto',
    'Desafio',
    'Conclusão',
    'Lógica de Programação',
    'Algoritmos',
    'HTML e CSS',
    'JavaScript',
    'Git e GitHub',
    'Desenvolvimento Front-end',
    'Desenvolvimento Back-end',
    'Banco de Dados',
    'Design de Interfaces',
    'Trabalho em Equipe',
    'Desenvolvimento de Projeto',
    'Projeto Final',
    'Certificação',
];

const activities: Tables<'activities'>[] = titles.map((title, index) => ({
    id:            `mock-activity-${index + 1}`,
    edition_id:    editionId,
    position:      index + 1,
    title,
    description:   null,
    material_path: null,
    activity_date: '2026-10-01',
    points:        30,
    created_by:    mentorId,
    created_at:    createdAt,
}));

// 8 completed activities, 9th is available
const attendance: MenteeRows['attendance'] = activities.slice(0, 8).map((activity) => ({
    id:            `mock-attendance-${activity.position}`,
    activity_id:   activity.id,
    mentee_id:     profileId,
    status:        'presente',
    checked_in_at: createdAt,
    confirmed_by:  null,
    activities:    { points: activity.points, edition_id: activity.edition_id },
}));

// 3 mastered activities, 9th is 65% completed
const activityProgress: Tables<'activity_progress'>[] = [
    ...activities.slice(0, 3).map((activity) => ({
        id:          `mock-progress-${activity.position}`,
        activity_id: activity.id,
        mentee_id:   profileId,
        progress:    100,
        mastered_at: createdAt,
        updated_at:  createdAt,
    })),
    {
        id:          'mock-progress-9',
        activity_id: 'mock-activity-9',
        mentee_id:   profileId,
        progress:    65,
        mastered_at: null,
        updated_at:  createdAt,
    },
];

export const mockRows: MenteeRows = {
    profile,
    email:         'anne.franco@exemplo.com',
    emailVerified: true,
    userStats: {
        profile_id:     profileId,
        streak_days:    4,
        last_active_on: todayInSaoPaulo(),
        lives:          5,
    },
    enrollments:        [enrollment],
    activities,
    attendance,
    activityProgress,
    signedCertificates: 0,
    mentors: [
        { id: mentorId, full_name: mentorProfile.full_name, avatar_url: '' },
    ],
    friends: [
        { friendship_id: 'mock-friendship-1', id: 'mock-profile-2', full_name: 'Larinha', username: 'larinha', total_xp: 4987  },
        { friendship_id: 'mock-friendship-2', id: 'mock-profile-3', full_name: 'Mica',    username: 'mica',    total_xp: 3240  },
        { friendship_id: 'mock-friendship-3', id: 'mock-profile-4', full_name: 'Rebeca',  username: 'rebeca',  total_xp: 12574 },
    ],
};

// mentees list as seen by the mentor (Maria) in demo mode
const otherMentor = { id: 'mock-profile-joana', full_name: 'Joana Pereira', avatar_url: null };
const mockEnrollment = (id: string, mentor: MenteeRow['enrollments'][number]['mentor']) => [{
    id,
    edition_id: editionId,
    editions:   { name: edition.name },
    mentor,
}];

export const mockMenteeRows: MenteeRow[] = [
    {
        id: profileId, full_name: profile.full_name, username: profile.username, avatar_url: null,
        enrollments: mockEnrollment(enrollment.id, { id: mentorId, full_name: mentorProfile.full_name, avatar_url: null }),
        user_stats: { streak_days: 4, last_active_on: todayInSaoPaulo() },
    },
    {
        id: 'mock-profile-5', full_name: 'Beatriz Lima', username: 'bia.lima', avatar_url: null,
        enrollments: [],
        user_stats: { streak_days: 0, last_active_on: null },
    },
    {
        id: 'mock-profile-2', full_name: 'Larissa Souza', username: 'larinha', avatar_url: null,
        enrollments: mockEnrollment('mock-enrollment-2', null),
        user_stats: { streak_days: 2, last_active_on: todayInSaoPaulo() },
    },
    {
        id: 'mock-profile-3', full_name: 'Micaela Rocha', username: 'mica', avatar_url: null,
        enrollments: mockEnrollment('mock-enrollment-3', null),
        user_stats: { streak_days: 7, last_active_on: todayInSaoPaulo() },
    },
    {
        id: 'mock-profile-4', full_name: 'Rebeca Alves', username: 'rebeca', avatar_url: null,
        enrollments: mockEnrollment('mock-enrollment-4', otherMentor),
        user_stats: { streak_days: 1, last_active_on: todayInSaoPaulo() },
    },
];

// general dashboard: attendance rate (%) of the mentor's mentees
export const mockOverviewRates: Record<string, number | null> = {
    [profileId]: 88,
};

// individual dashboard in demo mode: weekly activities counted back from today, so the charts are never empty
const daysAgo = (days: number) => {
    const date = new Date(`${todayInSaoPaulo()}T12:00:00Z`);
    date.setUTCDate(date.getUTCDate() - days);
    return date.toISOString().slice(0, 10);
};

export function mockDashboardInput(menteeId: string): DashboardInput | null {
    if (menteeId !== profileId) return null;

    // irregular dates and points, so the charts vary; the last two activities are still to come
    const offsets = [126, 119, 112, 108, 98, 91, 84, 80, 70, 63, 56, 49, 45, 35, 28, 17, 10, 3, -4, -11];
    const points  = [20, 30, 30, 40, 30, 50, 30, 60, 30, 40, 50, 30, 60, 20, 40, 50, 30, 60, 30, 40];

    const dated = activities.map((activity, index) => ({
        id:            activity.id,
        title:         activity.title,
        activity_date: daysAgo(offsets[index]),
        points:        points[index],
    }));

    const status = (index: number) =>
        [3, 8, 13].includes(index) ? 'falta' : [6, 12].includes(index) ? 'justificada' : 'presente';

    const at = (offset: number, hour = 19) => `${daysAgo(offset)}T${String(hour).padStart(2, '0')}:00:00Z`;

    const mastered = [0, 1, 2, 4, 5, 7, 8, 9, 11, 14];

    const attendance = dated.slice(0, 18).map((activity, index) => ({
        activity_id:   activity.id,
        status:        status(index),
        checked_in_at: `${activity.activity_date}T${index % 2 ? '18' : '14'}:00:00Z`,
    }));

    return {
        mentee:    { id: profileId, full_name: profile.full_name, username: profile.username, avatar_url: null },
        avatarUrl: null,
        trailName:     edition.name,
        trailSubtitle: edition.subtitle,
        activities:    dated,
        attendance,
        // demo has a single trail, so the total xp is the trail's
        xpAllTrails: dated.slice(0, 18).reduce(
            (total, activity, index) => total + (attendance[index].status === 'presente' ? activity.points : 0),
            0,
        ),
        reflections: [
            { rating: 5, created_at: at(110, 20) },
            { rating: 3, created_at: at(98, 21) },
            { rating: 4, created_at: at(84, 20) },
            { rating: 4, created_at: at(63, 22) },
            { rating: 2, created_at: at(56, 20) },
            { rating: 5, created_at: at(45, 21) },
            { rating: 3, created_at: at(28, 20) },
            { rating: 4, created_at: at(10, 20) },
        ],
        progress: [
            ...mastered.map((index) => ({
                activity_id: dated[index].id,
                progress:    100,
                mastered_at: `${dated[index].activity_date}T19:00:00Z`,
                updated_at:  `${dated[index].activity_date}T19:00:00Z`,
            })),
            // partial updates, some on the same day; the available activity (3, the first one not attended) has 65%
            ...[100, 100, 57, 57, 57, 29, 17, 3, 1].map((offset, index) => ({
                activity_id: dated[[6, 8, 12, 6, 13, 8, 18, 19, 3][index]].id,
                progress:    [10, 20, 30, 40, 50, 60, 15, 25, 65][index],
                mastered_at: null,
                updated_at:  at(offset),
            })),
        ],
        stats:             { streak_days: 9, last_active_on: todayInSaoPaulo() },
        certificateStatus: null,
    };
}

// list_mentee_xp in demo mode: Anne's xp is the sum of her present activities (same as her individual dashboard)
const anneInput = mockDashboardInput(profileId)!;
const anneXp = anneInput.attendance
    .filter((row) => row.status === 'presente')
    .reduce((total, row) => total + anneInput.activities.find((activity) => activity.id === row.activity_id)!.points, 0);

export const mockXpRows: XpRow[] = [
    { mentee_id: profileId,        edition_id: editionId, xp: anneXp },
    { mentee_id: 'mock-profile-2', edition_id: editionId, xp: 120 },
    { mentee_id: 'mock-profile-3', edition_id: editionId, xp: 210 },
    { mentee_id: 'mock-profile-4', edition_id: editionId, xp: 90  },
];
