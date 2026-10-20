'use client'

import { useRouter } from 'next/navigation'
import { getSupabase } from '#/utils/supabase/getSupabase'
import { ActionButton } from './ActionButton'

export function LogoutButton() {
    const router = useRouter()
    const supabase = getSupabase()

    async function handleLogout() {
        await supabase?.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    return (
        <ActionButton variant='brand' onClick={handleLogout}>
            Sair
        </ActionButton>
    )
}