import {
    CalendarCheck, CalendarClock, CalendarDays, CalendarX, ExternalLink, FileText, Link2, Lock, MapPin, Sparkles, Type,
} from 'lucide-react';

import QrScanner from '#/components/QrScanner/QrScanner';
import type { EventStatus } from '#/utils/menteeData';
import type { Tables } from '#/types/database';
import { formatEventTime } from '#/utils/dates';

import styles from './EventDetail.module.scss';

interface EventDetailProps {
    event: Pick<Tables<'activities'>, 'title' | 'description' | 'starts_at' | 'ends_at' | 'location' | 'points'>;
    status: EventStatus;
    // only filled after her presence (RLS)
    materials: (Tables<'activity_materials'> & { signedUrl: string | null })[];
}

const statusInfo: Record<EventStatus, { icon: typeof CalendarDays; label: string; text: string }> = {
    upcoming: {
        icon: CalendarClock,
        label: 'Em breve',
        text: 'Durante o encontro, valide sua presença lendo o QR Code que a mentora vai mostrar.',
    },
    today: {
        icon: CalendarDays,
        label: 'É hoje!',
        text: 'Durante o encontro, toque em Ler QR Code e aponte a câmera para o QR que a mentora mostrar.',
    },
    attended: {
        icon: CalendarCheck,
        label: 'Presença confirmada',
        text: 'Os materiais do encontro estão liberados para você.',
    },
    missed: {
        icon: CalendarX,
        label: 'Presença não confirmada',
        text: 'Este encontro já passou e a sua presença não foi registrada.',
    },
};

const materialIcons = { pdf: FileText, link: Link2, texto: Type };

export default function EventDetail({ event, status, materials }: EventDetailProps) {
    const info = statusInfo[status];
    const StatusIcon = info.icon;

    return (
        <div className={styles.event}>
            <section className={styles.header} aria-labelledby='event-name'>
                <h2 id='event-name'>{event.title}</h2>

                <ul className={styles.facts}>
                    <li>
                        <CalendarDays aria-hidden='true'/>
                        {event.starts_at ? formatEventTime(event.starts_at, event.ends_at) : 'Data a definir'}
                    </li>
                    <li>
                        <MapPin aria-hidden='true'/>
                        {event.location ?? 'Local a definir'}
                    </li>
                    <li className={styles.xp}>
                        <Sparkles aria-hidden='true'/>
                        {event.points} XP pela presença
                    </li>
                </ul>

                <p className={styles.description}>{event.description ?? 'Sem descrição.'}</p>
            </section>

            <section className={`${styles.status} ${styles[status]}`} aria-labelledby='status-title'>
                <h3 id='status-title'><StatusIcon aria-hidden='true'/>{info.label}</h3>
                <p>{info.text}</p>
            </section>

            {status === 'today' && <QrScanner/>}

            <section className={styles.materials} aria-labelledby='materials-title'>
                <h3 id='materials-title'>Materiais</h3>

                {status !== 'attended' ? (
                    <p className={styles.locked}>
                        <Lock aria-hidden='true'/>
                        Os materiais são liberados depois que você confirma a presença pelo QR Code.
                    </p>
                ) : materials.length ? (
                    <ul className={styles.list}>
                        {materials.map((material) => {
                            const Icon = materialIcons[material.kind as keyof typeof materialIcons] ?? FileText;

                            if (material.kind === 'texto') {
                                return (
                                    <li key={material.id} className={styles.text}>
                                        <h4><Icon aria-hidden='true'/>{material.title}</h4>
                                        {(material.body ?? '').split(/\n{2,}/).map((paragraph, index) => (
                                            <p key={index}>{paragraph}</p>
                                        ))}
                                    </li>
                                );
                            }

                            const href = material.kind === 'pdf' ? material.signedUrl : material.url;
                            return (
                                <li key={material.id}>
                                    {href ? (
                                        <a href={href} target='_blank' rel='noopener noreferrer' className={styles.link}>
                                            <Icon aria-hidden='true'/>
                                            <span>{material.title}</span>
                                            <ExternalLink aria-hidden='true'/>
                                            <span className='sr-only'>(abre em nova aba)</span>
                                        </a>
                                    ) : (
                                        <p className={styles.link}>
                                            <Icon aria-hidden='true'/>
                                            <span>{material.title}</span>
                                            <span className={styles.unavailable}>Indisponível</span>
                                        </p>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p className={styles.locked}>Nenhum material neste encontro.</p>
                )}
            </section>
        </div>
    );
}
