'use client';

import { useState } from 'react';

import Switch from '#/components/Switch/Switch';
import Toggle from '#/components/Toggle/Toggle';
import { applyAppearance, type Theme } from '#/utils/appearance';
import type { Preferences } from '#/utils/preferences';

import { usePreferenceSave } from './usePreferenceSave';

import styles from './Settings.module.scss';

const THEMES = [
    { value: 'light',  label: 'Claro'   },
    { value: 'dark',   label: 'Escuro'  },
    { value: 'system', label: 'Sistema' },
];

interface PreferencesFormProps {
    preferences: Preferences;
    // mentors have no trail: only the animations switch
    trailOptions?: boolean;
}

export function PreferencesForm({ preferences, trailOptions = true }: PreferencesFormProps) {
    const { save, saving, status } = usePreferenceSave();

    const [theme, setTheme] = useState(preferences.theme as Theme);
    const [animations, setAnimations] = useState(preferences.animations_enabled);

    // the theme and the animations change on the screen at once, even in demo mode
    function changeTheme(value: string) {
        const next = value as Theme;
        setTheme(next);
        applyAppearance(next, animations);
        save({ theme: next });
    }

    function changeAnimations(checked: boolean) {
        setAnimations(checked);
        applyAppearance(theme, checked);
        save({ animations_enabled: checked });
    }

    return (
        <>
            <section className={styles.section}>
                <h2>{trailOptions ? 'Sua trilha' : 'Movimento'}</h2>

                <div className={styles.options}>
                    {trailOptions && (
                        <Switch
                            name='sounds'
                            label='Efeitos sonoros'
                            defaultChecked={preferences.sounds_enabled}
                            disabled={saving}
                            onChange={(checked) => save({ sounds_enabled: checked })}
                        />
                    )}
                    <Switch
                        name='animations'
                        label='Animações'
                        defaultChecked={preferences.animations_enabled}
                        disabled={saving}
                        onChange={changeAnimations}
                    />
                    {trailOptions && (
                        <Switch
                            name='funnyMessages'
                            label='Mensagens engraçadinhas'
                            defaultChecked={preferences.funny_messages_enabled}
                            disabled={saving}
                            onChange={(checked) => save({ funny_messages_enabled: checked })}
                        />
                    )}
                </div>
            </section>

            <section className={styles.section}>
                <h2>Aparência</h2>
                <p>&ldquo;Sistema&rdquo; segue o tema claro ou escuro do seu celular.</p>

                <Toggle
                    name='theme'
                    label='Tema'
                    options={THEMES}
                    defaultValue={preferences.theme}
                    disabled={saving}
                    onChange={changeTheme}
                />
            </section>

            <p role='status' className={styles.status}>{status}</p>
        </>
    );
}
