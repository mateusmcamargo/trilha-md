import { Bell, Code, CodeXml, GraduationCap, Info, Route, ShieldCheck, ShieldQuestion, SlidersHorizontal, User, UserCog, Users, Venus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface SettingsLink {
    slug: string;
    label: string;
    icon: LucideIcon;
}

interface SettingsSection {
    title: string;
    links: SettingsLink[];
}

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
            { slug: 'contact-tutor',     label: 'Contactar sua tutora',      icon: GraduationCap },
            { slug: 'contact-project',   label: 'Contactar o projeto',       icon: Users         },
            { slug: 'contact-developer', label: 'Contactar o desenvolvedor', icon: CodeXml        },
        ],
    },
    {
        title: 'Sobre',
        links: [
            { slug: 'about-projet',       label: 'Sobre o Meninas Digitais',   icon: Venus          },
            { slug: 'about-app',          label: 'Sobre o aplicativo',         icon: Info           },
            { slug: 'privacy-disclaimer', label: 'Sobre os seus dados', icon: ShieldQuestion },
        ],
    },
];