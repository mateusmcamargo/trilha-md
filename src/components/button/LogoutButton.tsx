'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import styles from './LogoutButton.module.scss'
import PressableBase from '../PressableBase/PressableBase'

export function LogoutButton() {
    const router = useRouter()
    const supabase = createClient()

    async function handleLogout() {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    return (
        <PressableBase
            color='var(--color-brand-darker)'
            radius='1rem'
        >
            <button type='button' className={styles.logoutButton} onClick={handleLogout}>
                Sair
            </button>
        </PressableBase>
    )
}