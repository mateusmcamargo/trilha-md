'use client';

import Switch from '#/components/Switch/Switch';
import type { Preferences } from '#/utils/preferences';

import { usePreferenceSave } from './usePreferenceSave';

import styles from './Settings.module.scss';

type BooleanField = {
    [K in keyof Preferences]: Preferences[K] extends boolean ? K : never
}[keyof Preferences];

export interface SwitchGroup {
    title: string;
    description?: string;
    switches: { field: BooleanField; label: string }[];
}

interface PreferenceSwitchesProps {
    groups: SwitchGroup[];
    preferences: Preferences;
}

// notifications and privacy: each switch is saved as soon as it changes
export function PreferenceSwitches({ groups, preferences }: PreferenceSwitchesProps) {
    const { save, saving, status } = usePreferenceSave();

    return (
        <>
            {groups.map(({ title, description, switches }) => (
                <section key={title} className={styles.section}>
                    <h2>{title}</h2>
                    {description && <p>{description}</p>}

                    <div className={styles.options}>
                        {switches.map(({ field, label }) => (
                            <Switch
                                key={field}
                                name={field}
                                label={label}
                                defaultChecked={preferences[field]}
                                disabled={saving}
                                onChange={(checked) => save({ [field]: checked })}
                            />
                        ))}
                    </div>
                </section>
            ))}

            <p role='status' className={styles.status}>{status}</p>
        </>
    );
}
