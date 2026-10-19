import Link from 'next/link'
import styles from './AuthSwitchLink.module.scss'

interface AuthSwitchLinkProps {
    text: string
    href: string
    label: string
}

export function AuthSwitchLink({ text, href, label }: AuthSwitchLinkProps) {
    return (
        <p className={styles.switch}>
            {text} <Link href={href}>{label}</Link>
        </p>
    )
}