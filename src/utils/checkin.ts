// QR codes point to <origin>/checkin/<code>; returns the code, or null if the QR is from somewhere else
export function codeFromQr(text: string, origin: string) {
    const value = text.trim();

    // the bare code (12 hex characters) also works
    if (/^[0-9a-f]{12}$/i.test(value)) return value;

    try {
        const url = new URL(value);
        const match = url.pathname.match(/^\/checkin\/([^/]+)\/?$/);
        return url.origin === origin && match ? decodeURIComponent(match[1]) : null;
    } catch {
        return null;
    }
}

// error codes raised by the check_in RPC
export function checkinErrorMessage(errorCode: string | undefined) {
    switch (errorCode) {
        case '42501': return 'Você não está matriculada na edição deste encontro.';
        case 'CK001': return 'O encontro ainda não começou. Tente de novo no horário dele.';
        case 'CK002': return 'O encontro já terminou, então este código não vale mais.';
        default:      return 'Este código não vale. Peça para a mentora mostrar o QR Code de novo.';
    }
}
