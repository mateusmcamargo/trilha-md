'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Dumbbell, FileText, Route, TerminalSquare, TrendingUp } from 'lucide-react';

import { user } from '#/utils/mockData';
import { getInitials } from '#/utils/getInitials';

import styles from './Navbar.module.scss';

const navItems = [
    { href: '/panel/trail',    icon: Route,          label: 'Trilha'    },
    { href: '/panel/terminal', icon: TerminalSquare, label: 'Terminal'  },
    { href: '/panel/practice', icon: Dumbbell,       label: 'Praticar'  },
    { href: '/panel/files',    icon: FileText,       label: 'Materiais' },
    { href: '/panel/progress', icon: TrendingUp,     label: 'Progresso' },
] as const;

export default function Navbar() {

    const pathname = usePathname();
    const isActive = (href: string) =>
        pathname === href || pathname.startsWith(`${href}/`);

    return (
        <nav className={styles.nav} aria-label='Navegação principal'>
            {navItems.map(({ href, icon: Icon, label }) => (
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
                href='/panel/profile'
                className={`${styles.avatar} ${isActive('/panel/profile') ? styles.active : ''}`}
                aria-label='Meu perfil'
                aria-current={isActive('/panel/profile') ? 'page' : undefined}
            >
                <span>{getInitials(user.name)}</span>
            </Link>
        </nav>
    );
}