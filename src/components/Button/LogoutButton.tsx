'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { getSupabase } from '#/utils/supabase/getSupabase'
import { Button } from './Button'
import { ConfirmDialog } from '../Modal/ConfirmDialog'

export function LogoutButton() {
    const router = useRouter()
    const supabase = getSupabase()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleLogout() {
        setLoading(true)
        await supabase?.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    return (
        <>
            <Button variant='brand' fullWidth aria-haspopup='dialog' onClick={() => setOpen(true)}>
                Sair
            </Button>

            <ConfirmDialog
                open={open}
                onClose={() => setOpen(false)}
                onConfirm={handleLogout}
                title='Sair da conta?'
                description='Você precisará entrar de novo para continuar sua trilha.'
                confirmLabel='Sair'
                loadingLabel='Saindo...'
                icon={LogOut}
                loading={loading}
            />
        </>
    )
}
