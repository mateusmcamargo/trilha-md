'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import QrScannerLib from 'qr-scanner';

import { RefreshCw, ScanQrCode } from 'lucide-react';

import { Button } from '#/components/Button/Button';
import FormError from '#/components/FormError/FormError';
import { Modal } from '#/components/Modal/Modal';
import { useSound } from '#/components/SoundProvider/SoundProvider';
import { checkinErrorMessage, codeFromQr } from '#/utils/checkin';
import { getSupabase } from '#/utils/supabase/getSupabase';

import styles from './QrScanner.module.scss';

type Phase = 'scanning' | 'checking' | 'error';

function cameraErrorMessage(error: unknown) {
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
        return 'A câmera só funciona com o app aberto em uma conexão segura (https).';
    }
    const name = error instanceof Error ? error.name : String(error);
    return name === 'NotAllowedError' || /permission|denied/i.test(name)
        ? 'O app não tem permissão para usar a câmera. Libere a câmera nas configurações do navegador e tente de novo.'
        : 'Não encontramos uma câmera neste aparelho.';
}

// opens the camera, reads the mentor's QR Code and confirms the presence without leaving the page
export default function QrScanner() {
    const router = useRouter();
    const play = useSound();
    const videoRef = useRef<HTMLVideoElement>(null);

    const [open,    setOpen]    = useState<boolean>(false);
    const [phase,   setPhase]   = useState<Phase>('scanning');
    const [error,   setError]   = useState<string | null>(null);
    // bumping it restarts the camera
    const [attempt, setAttempt] = useState<number>(0);

    useEffect(() => {
        const video = videoRef.current;
        if (!open || !video) return;

        let done = false;

        const fail = (message: string) => {
            setError(message);
            setPhase('error');
        };

        const confirm = async (text: string) => {
            const code = codeFromQr(text, window.location.origin);
            if (!code) return fail('Este QR Code não é de um encontro. Aponte para o QR que a mentora mostrar.');

            const supabase = getSupabase();
            if (!supabase) return fail('Indisponível no modo demonstração.');

            setPhase('checking');
            const { error: checkError } = await supabase.rpc('check_in', { p_code: code });
            if (checkError) return fail(checkinErrorMessage(checkError.code));

            play('correct');
            setOpen(false);
            // the page reloads its data: status turns into "Presença confirmada" and the materials show up
            router.refresh();
        };

        const scanner = new QrScannerLib(video, (result) => {
            if (done) return;
            done = true;
            scanner.stop();
            confirm(result.data);
        }, {
            preferredCamera: 'environment',
            maxScansPerSecond: 10,
            returnDetailedScanResult: true,
        });

        scanner.start().catch((startError: unknown) => {
            if (!done) fail(cameraErrorMessage(startError));
        });

        return () => {
            done = true;
            scanner.destroy();
        };
    }, [open, attempt, play, router]);

    function handleOpen() {
        setError(null);
        setPhase('scanning');
        setOpen(true);
    }

    function handleRetry() {
        setError(null);
        setPhase('scanning');
        setAttempt((value) => value + 1);
    }

    const checking = phase === 'checking';

    return (
        <>
            <Button variant='brand' icon={ScanQrCode} fullWidth onClick={handleOpen}>Ler QR Code</Button>

            <Modal
                open={open}
                onClose={() => setOpen(false)}
                title='Ler QR Code'
                icon={ScanQrCode}
                description='Aponte a câmera para o QR Code que a mentora mostrar.'
                dismissible={!checking}
                actions={
                    <>
                        {phase === 'error' && (
                            <Button variant='brand' icon={RefreshCw} fullWidth onClick={handleRetry}>
                                Tentar de novo
                            </Button>
                        )}
                        <Button fullWidth data-autofocus disabled={checking} onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                    </>
                }
            >
                <div className={styles.viewfinder}>
                    <video ref={videoRef} playsInline muted aria-label='Imagem da câmera'/>
                    <span className={styles.frame} aria-hidden='true'/>
                </div>

                <div aria-live='polite'>
                    {checking && <p className={styles.status}>Confirmando presença...</p>}
                    {error && <FormError>{error}</FormError>}
                </div>
            </Modal>
        </>
    );
}
