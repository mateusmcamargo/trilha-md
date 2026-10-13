'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Dumbbell, FileText, Route, TerminalSquare, TrendingUp } from 'lucide-react';

import styles from './Navbar.module.scss';

const navItems = [
    { href: '/pannel/trail',    icon: Route,          label: 'Trilha'    },
    { href: '/pannel/terminal', icon: TerminalSquare, label: 'Terminal'  },
    { href: '/pannel/practice', icon: Dumbbell,       label: 'Praticar'  },
    { href: '/pannel/files',    icon: FileText,       label: 'Materiais' },
    { href: '/pannel/progress', icon: TrendingUp,     label: 'Progresso' },
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
                href='/pannel/profile'
                className={`${styles.avatar} ${isActive('/pannel/profile') ? styles.active : ''}`}
                aria-label='Meu perfil'
                aria-current={isActive('/pannel/profile') ? 'page' : undefined}
            >
                <span>AF</span>
            </Link>
        </nav>
    );
}