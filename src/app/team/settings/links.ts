import { CodeXml, Flag, Info, ShieldQuestion, SlidersHorizontal, UserCog, Users, Venus } from 'lucide-react';

import type { SettingsSection } from '#/components/Settings/SettingsMenu';

export const teamSettingsSections: SettingsSection[] = [
    {
        title: 'Conta',
        links: [
            { slug: 'preferences', label: 'Preferências', icon: SlidersHorizontal },
            { slug: 'profile',     label: 'Perfil',       icon: UserCog           },
        ],
    },
    {
        title: 'Moderação',
        links: [
            { slug: 'reports', label: 'Denúncias de abuso', icon: Flag },
        ],
    },
    {
        title: 'Ajuda',
        links: [
            { slug: 'contact-project',   label: 'Contactar o projeto',       icon: Users   },
            { slug: 'contact-developer', label: 'Contactar o desenvolvedor', icon: CodeXml },
        ],
    },
    {
        title: 'Sobre',
        links: [
            { slug: 'about-project',      label: 'Sobre o Meninas Digitais', icon: Venus          },
            { slug: 'about-app',          label: 'Sobre o aplicativo',       icon: Info           },
            { slug: 'privacy-disclaimer', label: 'Sobre os dados',           icon: ShieldQuestion },
        ],
    },
];
