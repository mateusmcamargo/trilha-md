'use client';

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

// files in public/sounds (made by sounds/generate.py)
const SOUNDS = {
    'click':      '/sounds/click.mp3',
    'tap':        '/sounds/tap.mp3',
    'toggle-on':  '/sounds/toggle-on.mp3',
    'toggle-off': '/sounds/toggle-off.mp3',
    'correct':    '/sounds/correct.mp3',
    'wrong':      '/sounds/wrong.mp3',
    'xp':         '/sounds/xp.mp3',
    'level-up':   '/sounds/level-up.mp3',
} as const;

export type SoundName = keyof typeof SOUNDS;

interface SoundContextValue {
    enabled: boolean;
    setEnabled: (enabled: boolean) => void;
    play: (name: SoundName) => void;
}

// outside the panels (login, register) there is no provider: no sound
const SoundContext = createContext<SoundContextValue>({
    enabled: false,
    setEnabled: () => {},
    play: () => {},
});

// play('correct'): plays only when "Efeitos sonoros" is on
export function useSound() {
    return useContext(SoundContext).play;
}

export function useSoundPreference() {
    const { enabled, setEnabled } = useContext(SoundContext);
    return [enabled, setEnabled] as const;
}

// what a click plays when the element has no data-sound
function soundForClick(target: Element): SoundName | null {
    const element = target.closest('[data-sound], button, a, [role="option"]');
    if (!element) return null;
    if (element.matches(':disabled, [aria-disabled="true"]')) return null;

    const custom = element.getAttribute('data-sound');
    if (custom === 'none') return null;
    if (custom && custom in SOUNDS) return custom as SoundName;
    return element.matches('[role="option"]') ? 'tap' : 'click';
}

// Web Audio: the MP3s are decoded once and play with no delay (and on iOS they
// don't stop the music of other apps, as an <audio> element would)
export function SoundProvider({ initialEnabled, children }: { initialEnabled: boolean; children: ReactNode }) {
    const [enabled, setEnabled] = useState(initialEnabled);

    const context = useRef<AudioContext | null>(null);
    const files = useRef<Partial<Record<SoundName, Promise<ArrayBuffer>>>>({});
    const buffers = useRef<Partial<Record<SoundName, Promise<AudioBuffer | null>>>>({});

    // downloads the files ahead, so the first sound isn't late
    useEffect(() => {
        if (!enabled) return;
        for (const [name, src] of Object.entries(SOUNDS) as [SoundName, string][]) {
            files.current[name] ??= fetch(src).then((response) => response.arrayBuffer());
        }
    }, [enabled]);

    function play(name: SoundName) {
        if (!enabled) return;

        // browsers only allow audio after a touch or key press, which is when play runs
        context.current ??= new AudioContext();
        const audio = context.current;
        if (audio.state === 'suspended') audio.resume();

        files.current[name] ??= fetch(SOUNDS[name]).then((response) => response.arrayBuffer());
        buffers.current[name] ??= files.current[name]
            .then((data) => audio.decodeAudioData(data))
            .catch(() => null);

        buffers.current[name].then((buffer) => {
            if (!buffer) return;
            const source = audio.createBufferSource();
            source.buffer = buffer;
            source.connect(audio.destination);
            source.start();
        });
    }

    // buttons, links and switches all over the panel: one listener instead of a hook in each
    useEffect(() => {
        if (!enabled) return;

        function handleClick(event: MouseEvent) {
            if (!(event.target instanceof Element)) return;
            // the label of a switch also fires a click: the change below plays it
            if (event.target.closest('label')?.querySelector('input')) return;
            const name = soundForClick(event.target);
            if (name) play(name);
        }

        function handleChange(event: Event) {
            const input = event.target;
            if (!(input instanceof HTMLInputElement)) return;
            if (input.type === 'checkbox') play(input.checked ? 'toggle-on' : 'toggle-off');
            else if (input.type === 'radio') play('toggle-on');
        }

        document.addEventListener('click', handleClick, true);
        document.addEventListener('change', handleChange, true);
        return () => {
            document.removeEventListener('click', handleClick, true);
            document.removeEventListener('change', handleChange, true);
        };
    });

    return (
        <SoundContext value={{ enabled, setEnabled, play }}>
            {children}
        </SoundContext>
    );
}
