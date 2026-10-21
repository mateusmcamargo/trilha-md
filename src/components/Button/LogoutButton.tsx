'use client'

import { useRouter } from 'next/navigation'
import { getSupabase } from '#/utils/supabase/getSupabase'
import { Button } from './Button'

export function LogoutButton() {
    const router = useRouter()
    const supabase = getSupabase()

    async function handleLogout() {
        await supabase?.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    return (
        <Button variant='brand' fullWidth onClick={handleLogout}>
            Sair
        </Button>
    )
}