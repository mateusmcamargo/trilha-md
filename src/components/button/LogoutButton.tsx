'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import styles from './LogoutButton.module.scss'

export function LogoutButton() {
    const router = useRouter()
    const supabase = createClient()

    async function handleLogout() {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    return (
        <button type='button' className={styles.button} onClick={handleLogout}>
            Sair
        </button>
    )
}