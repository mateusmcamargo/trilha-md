const TIME_ZONE = 'America/Sao_Paulo';

// YYYY-MM-DD same formaat used by touch_streak() in database
export function todayInSaoPaulo() {
    return new Date().toLocaleDateString('en-CA', { timeZone: TIME_ZONE });
}

// YYYY-MM-DD of a timestamp, in São Paulo
export function dayInSaoPaulo(timestamp: string) {
    return new Date(timestamp).toLocaleDateString('en-CA', { timeZone: TIME_ZONE });
}

export function yesterdayInSaoPaulo() {
    const date = new Date(`${todayInSaoPaulo()}T12:00:00Z`);
    date.setUTCDate(date.getUTCDate() - 1);
    return date.toISOString().slice(0, 10);
}

// date and time inputs <-> timestamp, always in São Paulo (no daylight saving since 2019: -03:00)
export function toSaoPauloInputs(timestamp: string) {
    const date = dayInSaoPaulo(timestamp);
    const time = new Date(timestamp).toLocaleTimeString('pt-BR', {
        timeZone: TIME_ZONE, hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    });
    return { date, time };
}

export function fromSaoPauloInputs(date: string, time: string) {
    return new Date(`${date}T${time}:00-03:00`).toISOString();
}

// "qui., 23/10 · 14:00–16:00"
export function formatEventTime(startsAt: string, endsAt: string | null) {
    const day = new Date(startsAt).toLocaleDateString('pt-BR', {
        timeZone: TIME_ZONE, weekday: 'short', day: '2-digit', month: '2-digit',
    });
    const start = toSaoPauloInputs(startsAt).time;
    return endsAt ? `${day} · ${start}–${toSaoPauloInputs(endsAt).time}` : `${day} · ${start}`;
}
