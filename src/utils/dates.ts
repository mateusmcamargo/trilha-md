const TIME_ZONE = 'America/Sao_Paulo';

// YYYY-MM-DD same formaat used by touch_streak() in database
export function todayInSaoPaulo() {
    return new Date().toLocaleDateString('en-CA', { timeZone: TIME_ZONE });
}

export function yesterdayInSaoPaulo() {
    const date = new Date(`${todayInSaoPaulo()}T12:00:00Z`);
    date.setUTCDate(date.getUTCDate() - 1);
    return date.toISOString().slice(0, 10);
}