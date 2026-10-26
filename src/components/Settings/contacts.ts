import { AtSign, Bug, CodeXml, Mail, type LucideIcon } from 'lucide-react';

export interface Contact {
    href: string;
    label: string;
    // what shows under the label (address, handle)
    detail: string;
    icon: LucideIcon;
}

// TODO: replace the example e-mails with the real ones
export const projectContacts: Contact[] = [
    {
        href: 'https://www.instagram.com/meninasdigitaisutfprcp/',
        label: 'Instagram',
        detail: '@meninasdigitaisutfprcp',
        icon: AtSign,
    },
    {
        href: 'mailto:meninasdigitais@exemplo.com',
        label: 'E-mail do projeto',
        detail: 'meninasdigitais@exemplo.com',
        icon: Mail,
    },
];

export const developerContacts: Contact[] = [
    {
        href: 'https://github.com/mateusmcamargo',
        label: 'GitHub',
        detail: 'github.com/mateusmcamargo',
        icon: CodeXml,
    },
    {
        href: 'https://github.com/mateusmcamargo/trilha-md/issues',
        label: 'Avisar de um problema no app',
        detail: 'Abre uma issue no repositório',
        icon: Bug,
    },
    {
        href: 'mailto:desenvolvedor@exemplo.com',
        label: 'E-mail do desenvolvedor',
        detail: 'desenvolvedor@exemplo.com',
        icon: Mail,
    },
];
