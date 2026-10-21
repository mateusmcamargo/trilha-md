'use client'

import { useId, useState } from 'react'
import { useRouter } from 'next/navigation'

import { MessageCircleQuestionMark, Ticket } from 'lucide-react'

import { getSupabase } from '#/utils/supabase/getSupabase'
import styles from './JoinEditionForm.module.scss'
import { Input } from '../Input/Input'
import { SubmitButton } from '../Button/SubmitButton'
import FormError from '../FormError/FormError'
import { FormTitle } from '../FormTitle/FormTitle'

export function JoinEditionForm() {
    const router   = useRouter()
    const supabase = getSupabase()
    const errorId  = useId()

    const [accessCode, setAccessCode] = useState<string>('')
    const [error,      setError]      = useState<string | null>(null)
    const [loading,    setLoading]    = useState<boolean>(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)

        const code = accessCode.trim()

        if (!code) return setError('Informe o código de acesso.')
        if (!supabase) return setError('Indisponível no modo demonstração.')

        setLoading(true)

        const { error: joinError } = await supabase.rpc('join_edition', { p_access_code: code })

        if (joinError) {
            setLoading(false)

            if (joinError.code === 'P0002') return setError('Código de acesso inválido.')
            return setError('Não foi possível entrar na trilha. Tente novamente.')
        }

        // refetches the panel data: the trail shows up in place of the form
        router.refresh()
        setLoading(false)
    }

    return (
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <FormTitle
                title='Nenhuma trilha ativa :('
                description='Você ainda não está matriculada em uma trilha. Use o código da sua tutora para entrar!'
            />

            <Input
                label='Código de acesso'
                icon={Ticket}
                help='Esse é o código que sua tutora te passou quando você se matriculou, por exemplo: "MD2026"'
                type='text'
                autoComplete='off'
                autoCapitalize='none'
                spellCheck={false}
                placeholder='Código da sua tutora'
                required
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                aria-invalid={!!error}
                aria-describedby={error ? errorId : undefined}
            />

            {error && <FormError id={errorId}>{error}</FormError>}

            <SubmitButton loading={loading} loadingLabel='Entrando...'>
                Entrar na trilha
            </SubmitButton>

            <button type='button' className={styles.help}>
                <MessageCircleQuestionMark/>
                <p>Preciso de ajuda</p>
            </button>
        </form>
    )
}