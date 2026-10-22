'use client';

import { useCallback, useEffect, useState } from 'react';
import QRCode from 'qrcode';

import { RefreshCw, UserRoundCheck } from 'lucide-react';

import { Button } from '#/components/Button/Button';
import FormError from '#/components/FormError/FormError';
import { getSupabase } from '#/utils/supabase/getSupabase';

import styles from './CheckinScreen.module.scss';

interface CheckinScreenProps {
    activityId: string;
    title: string;
}

interface Checkin {
    name: string;
    at: string;
}

// how long each code works; a new one can be made at any time
const CODE_MINUTES = 15;
const POLL_MS = 10_000;

const formatTime = (timestamp: string) => new Date(timestamp).toLocaleTimeString('pt-BR', {
    timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit',
});

export default function CheckinScreen({ activityId, title }: CheckinScreenProps) {
    const supabase = getSupabase();

    const [code,      setCode]      = useState<string | null>(null);
    const [expiresAt, setExpiresAt] = useState<string | null>(null);
    const [qr,        setQr]        = useState<string | null>(null);
    const [link,      setLink]      = useState<string | null>(null);
    const [expired,   setExpired]   = useState<boolean>(false);
    // demo mode shows an example
    const [checkins,  setCheckins]  = useState<Checkin[]>(() =>
        supabase ? [] : [{ name: 'Anne Franco', at: new Date().toISOString() }]);
    const [error,     setError]     = useState<string | null>(null);
    const [loading,   setLoading]   = useState<boolean>(true);

    // asks the database for a new code and draws its QR (demo mode: an example code)
    const generateCode = useCallback(async () => {
        let next: { code: string; expires_at: string } | null = null;

        if (supabase) {
            const { data, error: openError } = await supabase.rpc('open_checkin', {
                p_activity_id: activityId,
                p_minutes: CODE_MINUTES,
            });
            next = openError ? null : data?.[0] ?? null;
        } else {
            next = { code: 'demo2026', expires_at: new Date(Date.now() + CODE_MINUTES * 60_000).toISOString() };
        }

        if (!next) return null;

        const url = `${window.location.origin}/checkin/${next.code}`;
        return { ...next, url, qr: await QRCode.toDataURL(url, { margin: 1, width: 640 }) };
    }, [supabase, activityId]);

    const apply = useCallback((result: Awaited<ReturnType<typeof generateCode>>) => {
        setLoading(false);
        if (!result) return setError('Não foi possível gerar o código. Tente novamente.');
        setQr(result.qr);
        setLink(result.url);
        setCode(result.code);
        setExpiresAt(result.expires_at);
        setExpired(false);
    }, []);

    function handleNewCode() {
        setError(null);
        setLoading(true);
        generateCode().then(apply);
    }

    // first code as soon as the screen opens
    useEffect(() => {
        let ignore = false;
        generateCode().then((result) => {
            if (!ignore) apply(result);
        });
        return () => { ignore = true; };
    }, [generateCode, apply]);

    // marks the code as expired when its time is up
    useEffect(() => {
        if (!expiresAt) return;
        const timer = setTimeout(() => setExpired(true), Date.parse(expiresAt) - Date.now());
        return () => clearTimeout(timer);
    }, [expiresAt]);

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
                {qr && !expired ? (
                    // eslint-disable-next-line @next/next/no-img-element -- generated data url
                    <img src={qr} alt={`QR Code para confirmar presença em ${title}`}/>
                ) : (
                    <p className={styles.placeholder}>
                        {loading ? 'Gerando código...' : expired ? 'Este código venceu. Gere um novo.' : 'Sem código'}
                    </p>
                )}
            </div>

            {code && !expired && (
                <div className={styles.code}>
                    <p>Sem câmera? Acesse o link:</p>
                    <p className={styles.link}>{link}</p>
                    {expiresAt && <p className={styles.expires}>Vale até {formatTime(expiresAt)}</p>}
                </div>
            )}

            {error && <FormError>{error}</FormError>}

            <Button icon={RefreshCw} fullWidth disabled={loading} aria-busy={loading} onClick={handleNewCode}>
                Gerar novo código
            </Button>

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
