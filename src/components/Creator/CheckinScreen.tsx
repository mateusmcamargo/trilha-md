'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

import { RefreshCw, UserRoundCheck } from 'lucide-react';

import { Button } from '#/components/Button/Button';
import FormError from '#/components/FormError/FormError';
import { ConfirmDialog } from '#/components/Modal/ConfirmDialog';
import { dayInSaoPaulo, formatEventTime } from '#/utils/dates';
import { getSupabase } from '#/utils/supabase/getSupabase';

import styles from './CheckinScreen.module.scss';

interface CheckinScreenProps {
    activityId: string;
    title: string;
    // created with the event
    initialCode: string | null;
    startsAt: string | null;
    endsAt: string | null;
}

interface Checkin {
    name: string;
    at: string;
}

type Period = 'none' | 'before' | 'during' | 'after';

const POLL_MS = 10_000;

const formatTime = (timestamp: string) => new Date(timestamp).toLocaleTimeString('pt-BR', {
    timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit',
});

// same rule as check_in: from the start to the end (no end: until midnight of the event day)
function periodAt(startsAt: string | null, endsAt: string | null, now: number): Period {
    if (!startsAt) return 'none';
    const end = endsAt ? Date.parse(endsAt) : Date.parse(`${dayInSaoPaulo(startsAt)}T00:00:00-03:00`) + 86_400_000;
    return now < Date.parse(startsAt) ? 'before' : now > end ? 'after' : 'during';
}

const periodNotice: Record<Exclude<Period, 'during'>, string> = {
    none: 'Defina a data do encontro: sem ela o QR Code não funciona.',
    before: 'O encontro ainda não começou: o QR Code passa a funcionar no horário dele.',
    after: 'O encontro já terminou: o QR Code não funciona mais.',
};

export default function CheckinScreen({ activityId, title, initialCode, startsAt, endsAt }: CheckinScreenProps) {
    const supabase = getSupabase();

    const [code,     setCode]     = useState<string | null>(initialCode);
    const [qr,       setQr]       = useState<string | null>(null);
    const [link,     setLink]     = useState<string | null>(null);
    const [period,   setPeriod]   = useState<Period>(() => periodAt(startsAt, endsAt, Date.now()));
    // demo mode shows an example
    const [checkins, setCheckins] = useState<Checkin[]>(() =>
        supabase ? [] : [{ name: 'Anne Franco', at: new Date().toISOString() }]);
    const [error,    setError]    = useState<string | null>(null);
    const [loading,  setLoading]  = useState<boolean>(false);
    const [confirm,  setConfirm]  = useState<boolean>(false);

    // draws the QR of the current code
    useEffect(() => {
        if (!code) return;

        let ignore = false;
        const url = `${window.location.origin}/checkin/${code}`;
        QRCode.toDataURL(url, { margin: 1, width: 640 }).then((dataUrl) => {
            if (ignore) return;
            setQr(dataUrl);
            setLink(url);
        });
        return () => { ignore = true; };
    }, [code]);

    // keeps the "starts / is over" notice up to date while the screen is open
    useEffect(() => {
        const timer = setInterval(() => setPeriod(periodAt(startsAt, endsAt, Date.now())), 30_000);
        return () => clearInterval(timer);
    }, [startsAt, endsAt]);

    // a new code invalidates the old QR (e.g. a photo of it was shared)
    async function handleRenew() {
        setError(null);
        if (!supabase) {
            setConfirm(false);
            return setError('Indisponível no modo demonstração.');
        }

        setLoading(true);
        const { data, error: renewError } = await supabase.rpc('renew_checkin', { p_activity_id: activityId });
        setLoading(false);
        setConfirm(false);
        if (renewError || !data) return setError('Não foi possível gerar o código. Tente novamente.');
        setCode(data);
    }

    // who already confirmed (RLS: only the mentor's own mentees)
    useEffect(() => {
        if (!supabase) return;

        let ignore = false;
        const load = async () => {
            const { data } = await supabase
                .from('attendance')
                .select('checked_in_at, profiles!attendance_mentee_id_fkey(full_name)')
                .eq('activity_id', activityId)
                .eq('status', 'presente')
                .order('checked_in_at', { ascending: false });
            if (ignore || !data) return;
            setCheckins(data.map((row) => ({
                name: row.profiles?.full_name ?? 'Sem nome',
                at: row.checked_in_at ?? '',
            })));
        };

        load();
        const timer = setInterval(load, POLL_MS);
        return () => {
            ignore = true;
            clearInterval(timer);
        };
    }, [supabase, activityId]);

    return (
        <div className={styles.screen}>
            <h2 className={styles.title}>{title}</h2>

            <div className={styles.qr}>
                {qr ? (
                    // eslint-disable-next-line @next/next/no-img-element -- generated data url
                    <img src={qr} alt={`QR Code para confirmar presença em ${title}`}/>
                ) : (
                    <p className={styles.placeholder}>{code ? 'Gerando QR Code...' : 'Sem código. Gere um novo.'}</p>
                )}
            </div>

            <div className={styles.code}>
                {link && (
                    <>
                        <p>Sem câmera? Acesse o link:</p>
                        <p className={styles.link}>{link}</p>
                    </>
                )}
                <p className={styles.expires}>
                    {startsAt ? `Vale durante o encontro: ${formatEventTime(startsAt, endsAt)}` : 'Sem data definida'}
                </p>
            </div>

            {period !== 'during' && <FormError>{periodNotice[period]}</FormError>}
            {error && <FormError>{error}</FormError>}

            <Button icon={RefreshCw} fullWidth disabled={loading} onClick={() => setConfirm(true)}>
                Gerar novo código
            </Button>

            <ConfirmDialog
                open={confirm}
                onClose={() => setConfirm(false)}
                onConfirm={handleRenew}
                title='Gerar novo código?'
                description='O QR Code atual para de funcionar. Use se uma foto dele foi compartilhada com quem não está no encontro.'
                confirmLabel='Gerar novo código'
                loadingLabel='Gerando...'
                icon={RefreshCw}
                loading={loading}
            />

            <section className={styles.checkins} aria-labelledby='checkins-title' aria-live='polite'>
                <h3 id='checkins-title'>
                    <UserRoundCheck aria-hidden='true'/>
                    Suas mentoradas confirmadas ({checkins.length})
                </h3>
                {checkins.length ? (
                    <ul>
                        {checkins.map((checkin) => (
                            <li key={`${checkin.name}-${checkin.at}`}>
                                <span>{checkin.name}</span>
                                <span className={styles.time}>{checkin.at ? formatTime(checkin.at) : 'Sem horário'}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className={styles.placeholder}>Ninguém confirmou ainda.</p>
                )}
            </section>
        </div>
    );
}
