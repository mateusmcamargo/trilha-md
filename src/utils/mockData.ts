import type { Tables } from '#/types/database';

import { todayInSaoPaulo } from './dates';
import type { MenteeRows } from './menteeData';
import type { MenteeRow } from './teamData';

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
