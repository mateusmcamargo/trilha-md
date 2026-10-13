export const stats = {
    streak: 4,
    life: 5,
    xp: 240,
    totalXp: 6430,
};

// note: progress will be calculated as percentage, based on how many topics were completed
export const trailItems = [
    {
        id: '1',
        title: 'Boas-vindas',
        status: 'mastered' as const,
        progress: 100,
    },
    {
        id: '2',
        title: 'Tecnologia',
        status: 'mastered' as const,
        progress: 100,
    },
    {
        id: '3',
        title: 'Programação',
        status: 'mastered' as const,
        progress: 100,
    },
    {
        id: '4',
        title: 'Web',
        status: 'completed' as const,
        progress: 100,
    },
    {
        id: '5',
        title: 'Projeto',
        status: 'completed' as const,
        progress: 100,
    },
    {
        id: '6',
        title: 'Desafio',
        status: 'completed' as const,
        progress: 100,
    },
    {
        id: '7',
        title: 'Conclusão',
        status: 'completed' as const,
        progress: 100,
    },
    {
        id: '8',
        title: 'Lógica de Programação',
        status: 'completed' as const,
        progress: 100,
    },
    {
        id: '9',
        title: 'Algoritmos',
        status: 'available' as const,
        progress: 65,
    },
    {
        id: '10',
        title: 'HTML e CSS',
        status: 'available' as const,
        progress: 30,
    },
    {
        id: '11',
        title: 'JavaScript',
        status: 'locked' as const,
        progress: 0,
    },
    {
        id: '12',
        title: 'Git e GitHub',
        status: 'locked' as const,
        progress: 0,
    },
    {
        id: '13',
        title: 'Desenvolvimento Front-end',
        status: 'locked' as const,
        progress: 0,
    },
    {
        id: '14',
        title: 'Desenvolvimento Back-end',
        status: 'locked' as const,
        progress: 0,
    },
    {
        id: '15',
        title: 'Banco de Dados',
        status: 'locked' as const,
        progress: 0,
    },
    {
        id: '16',
        title: 'Design de Interfaces',
        status: 'locked' as const,
        progress: 0,
    },
    {
        id: '17',
        title: 'Trabalho em Equipe',
        status: 'locked' as const,
        progress: 0,
    },
    {
        id: '18',
        title: 'Desenvolvimento de Projeto',
        status: 'locked' as const,
        progress: 0,
    },
    {
        id: '19',
        title: 'Projeto Final',
        status: 'locked' as const,
        progress: 0,
    },
    {
        id: '20',
        title: 'Certificação',
        status: 'locked' as const,
        progress: 0,
    },
    ];

export const people = {
    mentors: [
        { id: '1', name: 'Maria', xp: 25279 },
    ],
    friends: [
        { id: '2', name: 'Larinha', xp: 4987 },
        { id: '3', name: 'Mica',    xp: 3240 },
        { id: '4', name: 'Rebeca',  xp: 12574 },
    ],
};

const completed = trailItems.filter(
    (item) => item.status === 'completed'
).length;

export const trailProgress = Math.round(
    (completed / trailItems.length) * 100
);