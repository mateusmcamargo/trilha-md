'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Dumbbell, FileText, LayoutDashboard, Route, TerminalSquare, TrendingUp, UserRoundGroup } from 'lucide-react';

import styles from './Navbar.module.scss';

const navItems = {
    mentee: [
        { href: '/trail',    icon: Route,          label: 'Trilha'    },
        { href: '/terminal', icon: TerminalSquare, label: 'Terminal'  },
        { href: '/practice', icon: Dumbbell,       label: 'Praticar'  },
        { href: '/files',    icon: FileText,       label: 'Materiais' },
        { href: '/progress', icon: TrendingUp,     label: 'Progresso' },
    ],
    mentor: [
        { href: '/team/dashboard', icon: LayoutDashboard, label: 'Painel' },
        { href: '/team/mentees',   icon: UserRoundGroup,  label: 'Meninas' },
    ],
} as const;

const profileHref = {
    mentee: '/profile',
    mentor: '/team/profile',
} as const;

export type NavRole = keyof typeof navItems;

interface NavbarProps {
    role: NavRole;
    initials: string;
}

export default function Navbar({ role, initials }: NavbarProps) {

    const pathname = usePathname();
    const isActive = (href: string) =>
        pathname === href || pathname.startsWith(`${href}/`);

    return (
        <nav className={styles.nav} aria-label='Navegação principal'>
            {navItems[role].map(({ href, icon: Icon, label }) => (
                <Link
                    key={href}
                    href={href}
                    className={`${styles.navButton} ${isActive(href) ? styles.active : ''}`}
                    aria-label={label}
                    aria-current={isActive(href) ? 'page' : undefined}
                >
                    <Icon aria-hidden='true'/>
                </Link>
            ))}
            <Link
                href={profileHref[role]}
                className={`${styles.avatar} ${isActive(profileHref[role]) ? styles.active : ''}`}
                aria-label='Meu perfil'
                aria-current={isActive(profileHref[role]) ? 'page' : undefined}
            >
                <span>{initials}</span>
            </Link>
        </nav>
    );
}