// theme and animations: saved in user_preferences and mirrored in cookies,
// so the inline script in app/layout.tsx applies them before the first paint

export type Theme = 'light' | 'dark' | 'system';

export const THEME_COOKIE  = 'theme';
export const MOTION_COOKIE = 'motion';
// sounds: only read in demo mode, where nothing is saved (getPreferences)
export const SOUNDS_COOKIE = 'sounds';

const ONE_YEAR = 60 * 60 * 24 * 365;

// runs in <head> before the page paints; keep it in sync with applyAppearance
export const appearanceScript = `(function(){try{
var d=document.documentElement,c=document.cookie;
var t=(c.match(/(?:^|; )${THEME_COOKIE}=([^;]*)/)||[])[1];
var m=(c.match(/(?:^|; )${MOTION_COOKIE}=([^;]*)/)||[])[1];
if(t==='system')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';
if(t==='dark')d.setAttribute('data-theme','dark');
if(m==='reduced')d.setAttribute('data-motion','reduced');
}catch(e){}})()`;

function readCookie(name: string) {
    return document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))?.[1];
}

// client only: saves the cookies and updates <html> at once
export function applyAppearance(theme: Theme, animations: boolean) {
    document.cookie = `${THEME_COOKIE}=${theme}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
    document.cookie = `${MOTION_COOKIE}=${animations ? 'full' : 'reduced'}; path=/; max-age=${ONE_YEAR}; samesite=lax`;

    const dark = theme === 'dark'
        || (theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);

    const root = document.documentElement;
    if (dark) root.setAttribute('data-theme', 'dark');
    else root.removeAttribute('data-theme');

    if (animations) root.removeAttribute('data-motion');
    else root.setAttribute('data-motion', 'reduced');
}

// true when this device's cookies differ from the saved preferences
export function appearanceChanged(theme: Theme, animations: boolean) {
    return readCookie(THEME_COOKIE) !== theme
        || readCookie(MOTION_COOKIE) !== (animations ? 'full' : 'reduced');
}
