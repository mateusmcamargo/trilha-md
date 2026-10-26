import type { ActivityItem, CompleteCodeContent, ItemSolution } from '#/components/minigames/types';
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
    id:              profileId,
    role:            'mentee',
    full_name:       'Anne Franco',
    username:        'anne.franco26',
    avatar_url:      null,
    deleted_at:      null,
    deletion_reason: null,
    created_at:      createdAt,
};

export const mentorProfile: Tables<'profiles'> = {
    id:              mentorId,
    role:            'mentor',
    full_name:       'Maria da Silva',
    username:        'maria',
    avatar_url:      null,
    deleted_at:      null,
    deletion_reason: null,
    created_at:      createdAt,
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

// editions the mentor sees in the creator (demo mode)
export const mockEditions = [{ id: editionId, name: edition.name, status: edition.status }];

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

// individual dashboard and events: dates counted back from today, so the charts are never empty
const daysAgo = (days: number) => {
    const date = new Date(`${todayInSaoPaulo()}T12:00:00Z`);
    date.setUTCDate(date.getUTCDate() - days);
    return date.toISOString().slice(0, 10);
};

const at = (offset: number, hour = 19) => `${daysAgo(offset)}T${String(hour).padStart(2, '0')}:00:00Z`;

export const mockActivities: Tables<'activities'>[] = titles.map((title, index) => ({
    id:          `mock-activity-${index + 1}`,
    edition_id:  editionId,
    kind:        'remota',
    position:    index + 1,
    parent_id:   null,
    title,
    description: null,
    starts_at:   null,
    ends_at:     null,
    location:    null,
    points:      30,
    created_by:  mentorId,
    created_at:  createdAt,
}));

// in-person events hanging beside some remote nodes: [parent position, title, days ago]
const eventSpecs: [number, string, number][] = [
    [1, 'Oficina de boas-vindas', 60],
    [3, 'Roda de conversa: mulheres na computação', 45],
    [5, 'Aula prática de HTML', 30],
    [7, 'Reunião da equipe', 14],
    [9, 'Oficina de lógica com papel', 0],
    [9, 'Roda de conversa: carreira', -3],
    [9, 'Visita técnica', -10],
    [12, 'Hackathon da turma', -20],
];

export const mockEvents: Tables<'activities'>[] = eventSpecs.map(([parent, title, offset], index) => ({
    id:          `mock-event-${index + 1}`,
    edition_id:  editionId,
    kind:        'presencial',
    position:    null,
    parent_id:   `mock-activity-${parent}`,
    title,
    description: 'Encontro presencial da turma com as mentoras.',
    starts_at:   at(offset, 17),
    ends_at:     at(offset, 19),
    location:    'UTFPR-CP, laboratório E-003',
    points:      20,
    created_by:  mentorId,
    created_at:  createdAt,
}));

const ITEMS_PER_ACTIVITY = 5;

const trailActivities = [...mockActivities, ...mockEvents].map((activity) => ({
    ...activity,
    itemCount: activity.kind === 'remota' ? ITEMS_PER_ACTIVITY : 0,
}));

// 8 completed activities (3 of them with every item right), the 9th has 3 of 5 items answered
const attempts: MenteeRows['attempts'] = [
    ...mockActivities.slice(0, 8).map((activity, index) => ({
        activity_id:   activity.id,
        finished_at:   createdAt,
        correct_count: index < 3 ? ITEMS_PER_ACTIVITY : 3,
        total_count:   ITEMS_PER_ACTIVITY,
        answered:      ITEMS_PER_ACTIVITY,
    })),
    { activity_id: 'mock-activity-9', finished_at: null, correct_count: null, total_count: null, answered: 3 },
];

// presence in the first 3 events (the 4th was missed)
const attendedIds = mockEvents.slice(0, 3).map((event) => event.id);

const xpEntries: MenteeRows['xpEntries'] = [
    ...attempts.filter((attempt) => attempt.finished_at).map((attempt) => ({
        edition_id: editionId,
        xp:         Math.round((30 * attempt.correct_count!) / attempt.total_count!),
    })),
    ...attendedIds.map(() => ({ edition_id: editionId, xp: 20 })),
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
    activities:         trailActivities,
    attempts,
    attendedIds,
    xpEntries,
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

export function mockDashboardInput(menteeId: string): DashboardInput | null {
    if (menteeId !== profileId) return null;

    // irregular dates and scores, so the charts vary; the last activities are still to come
    const offsets = [126, 119, 112, 108, 98, 91, 84, 80, 70, 63, 56, 49, 45, 35, 28, 17, 10, 3];
    const correct = [5, 5, 4, 3, 5, 2, 4, 5, 3, 4, 5, 1, 4, 3, 5, 2, 4, 3];

    const finished = offsets.map((offset, index) => ({
        activity_id:   mockActivities[index].id,
        finished_at:   at(offset, index % 2 ? 18 : 14),
        correct_count: correct[index],
        total_count:   ITEMS_PER_ACTIVITY,
        answered:      ITEMS_PER_ACTIVITY,
    }));

    // in the 4th event she sent a justification; past events without a record count as absences
    const attendance = mockEvents.slice(0, 4).flatMap((event, index) =>
        index === 1 ? [] : [{
            activity_id:   event.id,
            status:        index === 3 ? 'justificada' : 'presente',
            checked_in_at: event.starts_at,
        }]);

    const xpEntries = [
        ...finished.map((attempt) => ({
            xp:        Math.round((30 * attempt.correct_count) / ITEMS_PER_ACTIVITY),
            earned_at: attempt.finished_at,
        })),
        ...attendance.filter((row) => row.status === 'presente')
            .map((row) => ({ xp: 20, earned_at: row.checked_in_at })),
    ];

    return {
        mentee:    { id: profileId, full_name: profile.full_name, username: profile.username, avatar_url: null },
        avatarUrl: null,
        trailName:     edition.name,
        trailSubtitle: edition.subtitle,
        activities:    trailActivities,
        attendance,
        attempts: [
            ...finished,
            { activity_id: mockActivities[18].id, finished_at: null, correct_count: null, total_count: null, answered: 3 },
        ],
        answers: finished.flatMap((attempt) => Array.from({ length: ITEMS_PER_ACTIVITY }, (_, index) => ({
            is_correct: index < attempt.correct_count,
        }))),
        xpEntries,
        // demo has a single trail, so the total xp is the trail's
        xpAllTrails: xpEntries.reduce((total, row) => total + row.xp, 0),
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
        stats:             { streak_days: 9, last_active_on: todayInSaoPaulo() },
        certificateStatus: null,
    };
}

// list_mentee_xp in demo mode: same xp as her individual dashboard
const anneXp = mockDashboardInput(profileId)!.xpAllTrails;

export const mockXpRows: XpRow[] = [
    { mentee_id: profileId,        edition_id: editionId, xp: anneXp },
    { mentee_id: 'mock-profile-2', edition_id: editionId, xp: 120 },
    { mentee_id: 'mock-profile-3', edition_id: editionId, xp: 210 },
    { mentee_id: 'mock-profile-4', edition_id: editionId, xp: 90  },
];

// items of every remote activity in demo mode (same 5 for all), with the answer key
const sampleItems: { content: CompleteCodeContent; solution: string[]; explanation: string }[] = [
    {
        content: {
            instruction: 'Complete o código:',
            code: 'if (idade >= 18) {\n  [[0]]\n}',
            options: [
                { id: 'a', text: 'adulto = false;' },
                { id: 'b', text: 'adulto = true;' },
                { id: 'c', text: 'idade--;' },
            ],
        },
        solution: ['b'],
        explanation: 'Se a idade é 18 ou mais, a pessoa é adulta: adulto recebe true.',
    },
    {
        content: {
            instruction: 'Complete o código para mostrar uma mensagem:',
            code: '[[0]]("Olá, mundo!");',
            options: [
                { id: 'a', text: 'console.log' },
                { id: 'b', text: 'print.console' },
                { id: 'c', text: 'alert.log' },
            ],
        },
        solution: ['a'],
        explanation: 'console.log mostra uma mensagem no console.',
    },
    {
        content: {
            instruction: 'Complete a repetição de 1 a 5:',
            code: 'for (let i = 1; i [[0]] 5; i[[1]]) {\n  console.log(i);\n}',
            options: [
                { id: 'a', text: '<=' },
                { id: 'b', text: '>=' },
                { id: 'c', text: '++' },
                { id: 'd', text: '--' },
            ],
        },
        solution: ['a', 'c'],
        explanation: 'i começa em 1, repete enquanto i <= 5 e aumenta de 1 em 1 com ++.',
    },
    {
        content: {
            instruction: 'Complete a condição: as duas precisam ser verdadeiras.',
            code: 'if (temIngresso [[0]] maiorDeIdade) {\n  entrar();\n}',
            options: [
                { id: 'a', text: '||' },
                { id: 'b', text: '&&' },
                { id: 'c', text: '!' },
            ],
        },
        solution: ['b'],
        explanation: '&& (E) só é verdadeiro quando os dois lados são verdadeiros.',
    },
    {
        content: {
            instruction: 'Guarde o nome em uma variável:',
            code: '[[0]] nome = [[1]];',
            options: [
                { id: 'a', text: 'let' },
                { id: 'b', text: '"Ada"' },
                { id: 'c', text: 'if' },
                { id: 'd', text: 'Ada' },
            ],
        },
        solution: ['a', 'b'],
        explanation: 'let cria a variável, e texto fica entre aspas: "Ada".',
    },
];

export function mockActivityItems(activityId: string) {
    const items: ActivityItem[] = sampleItems.map((sample, index) => ({
        id: `${activityId}-item-${index + 1}`,
        type: 'complete_codigo',
        content: sample.content,
    }));

    const solutions: Record<string, ItemSolution> = Object.fromEntries(sampleItems.map((sample, index) => [
        `${activityId}-item-${index + 1}`,
        { solution: { blanks: sample.solution }, explanation: sample.explanation },
    ]));

    return { items, solutions };
}

// materials of the in-person events in demo mode
export const mockMaterials: Tables<'activity_materials'>[] = mockEvents.flatMap((event) => [
    {
        id: `${event.id}-material-1`, activity_id: event.id, position: 1, kind: 'link',
        title: 'Site do Meninas Digitais', url: 'https://meninas.sbc.org.br/',
        storage_path: null, body: null, created_at: createdAt,
    },
    {
        id: `${event.id}-material-2`, activity_id: event.id, position: 2, kind: 'texto',
        title: 'Resumo do encontro', url: null, storage_path: null, created_at: createdAt,
        body: 'Hoje conhecemos a turma, combinamos os horários e exploramos a trilha juntas.\n\nNo próximo encontro, traga suas dúvidas!',
    },
]);

// settings in demo mode: database defaults
export const mockPreferences: Tables<'user_preferences'> = {
    profile_id:             profileId,
    theme:                  'light',
    sounds_enabled:         true,
    animations_enabled:     true,
    funny_messages_enabled: true,
    notify_events:          true,
    notify_streak:          true,
    notify_trail_updates:   true,
    show_in_search:         true,
    show_xp_to_friends:     true,
};

export const mockMentorContact = {
    id:        mentorId,
    full_name: mentorProfile.full_name,
    email:     'maria.silva@exemplo.com',
};

// abuse reports as seen by the mentor in demo mode
export const mockAbuseReports: (Tables<'abuse_reports'> & {
    reporter: Pick<Tables<'profiles'>, 'full_name' | 'username'> | null;
})[] = [
    {
        id: 'mock-report-1', reporter_id: profileId, reported_username: 'perfil.estranho',
        category: 'perfil_falso', status: 'aberta', created_at: '2026-10-20T14:30:00Z',
        description: 'Esse perfil diz ser de uma mentora, mas eu não conheço e está pedindo meu telefone.',
        reporter: { full_name: profile.full_name, username: profile.username },
    },
    {
        id: 'mock-report-2', reporter_id: 'mock-profile-5', reported_username: null,
        category: 'outro', status: 'resolvida', created_at: '2026-10-12T09:10:00Z',
        description: 'Recebi uma mensagem com um link estranho depois do encontro.',
        reporter: { full_name: 'Beatriz Lima', username: 'bia.lima' },
    },
];
