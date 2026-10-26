'use client';

import { useState } from 'react';

import type { TablesUpdate } from '#/types/database';
import { getSupabase } from '#/utils/supabase/getSupabase';

// saves part of the user's own user_preferences row, right after each change
export function usePreferenceSave() {
    const supabase = getSupabase();

    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState('');

    async function save(fields: TablesUpdate<'user_preferences'>) {
        // demonstration mode: nothing is saved
        if (!supabase) {
            setStatus('Modo demonstração: nada foi salvo.');
            return;
        }

        setSaving(true);
        setStatus('Salvando...');

        const { data: { user } } = await supabase.auth.getUser();
        const { error } = user
            ? await supabase.from('user_preferences').update(fields).eq('profile_id', user.id)
            : { error: true };

        setSaving(false);
        setStatus(error
            ? 'ERRO: Não foi possível salvar. Confira a conexão e tente de novo.'
            : 'Salvo!');
    }

    return { save, saving, status };
}
