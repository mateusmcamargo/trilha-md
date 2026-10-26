import type { SwitchGroup } from './PreferenceSwitches';

export const notificationGroups: SwitchGroup[] = [
    {
        title: 'Me avise sobre',
        description: 'Escolha os avisos que você quer receber.',
        switches: [
            { field: 'notify_events',        label: 'Encontros presenciais' },
            { field: 'notify_streak',        label: 'Lembrete da ofensiva'  },
            { field: 'notify_trail_updates', label: 'Atividades novas'      },
        ],
    },
];

export const privacyGroups: SwitchGroup[] = [
    {
        title: 'Comunidade',
        description: 'Suas amigas e as mentoras continuam vendo o seu nome.',
        switches: [
            { field: 'show_in_search',     label: 'Aparecer na busca por usuário' },
            { field: 'show_xp_to_friends', label: 'Mostrar meu XP para amigas'    },
        ],
    },
];
