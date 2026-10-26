import { Bell, CodeXml, Flag, GraduationCap, Info, Route, ShieldCheck, ShieldQuestion, SlidersHorizontal, UserCog, Users, Venus } from 'lucide-react';

import type { SettingsSection } from '#/components/Settings/SettingsMenu';

export const settingsSections: SettingsSection[] = [
    {
        title: 'Conta',
        links: [
            { slug: 'preferences',   label: 'Preferências', icon: SlidersHorizontal },
            { slug: 'profile',       label: 'Perfil',       icon: UserCog           },
            { slug: 'notifications', label: 'Notificações', icon: Bell              },
            { slug: 'trails',        label: 'Trilhas',      icon: Route             },
            { slug: 'privacy',       label: 'Privacidade',  icon: ShieldCheck       },
        ],
    },
    {
        title: 'Ajuda',
        links: [
            { slug: 'contact-mentor',     label: 'Contactar sua mentora',      icon: GraduationCap },
            { slug: 'contact-project',   label: 'Contactar o projeto',       icon: Users         },
            { slug: 'contact-developer', label: 'Contactar o desenvolvedor', icon: CodeXml       },
            { slug: 'report-abuse',      label: 'Reportar abuso',            icon: Flag          },
        ],
    },
    {
        title: 'Sobre',
        links: [
            { slug: 'about-project',      label: 'Sobre o Meninas Digitais', icon: Venus          },
            { slug: 'about-app',          label: 'Sobre o aplicativo',       icon: Info           },
            { slug: 'privacy-disclaimer', label: 'Sobre os seus dados',      icon: ShieldQuestion },
        ],
    },
];