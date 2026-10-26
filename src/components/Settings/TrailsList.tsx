import { formatDate } from '#/utils/dates';

import styles from './Settings.module.scss';

export interface EnrollmentSummary {
    id: string;
    name: string;
    subtitle: string | null;
    status: string;
    enrolledAt: string;
    xp: number;
    mentorName: string | null;
}

const STATUS_LABEL: Record<string, string> = {
    active:    'Atual',
    pending:   'Aguardando',
    completed: 'Concluída',
    dropped:   'Encerrada',
};

export function TrailsList({ enrollments }: { enrollments: EnrollmentSummary[] }) {
    if (!enrollments.length) {
        return <p>Você ainda não entrou em nenhuma trilha.</p>;
    }

    return (
        <ul className={styles.cards}>
            {enrollments.map((enrollment) => (
                <li key={enrollment.id} className={styles.card}>
                    <span className={[styles.tag, enrollment.status !== 'active' && styles.muted]
                        .filter(Boolean).join(' ')}>
                        {STATUS_LABEL[enrollment.status] ?? enrollment.status}
                    </span>

                    <h3>{enrollment.name}</h3>
                    <p>{enrollment.subtitle || 'Sem descrição'}</p>

                    <dl>
                        <dt>Mentora</dt>
                        <dd>{enrollment.mentorName ?? 'Sem mentora'}</dd>

                        <dt>XP da trilha</dt>
                        <dd>{enrollment.xp} XP</dd>

                        <dt>Entrou em</dt>
                        <dd>{formatDate(enrollment.enrolledAt)}</dd>
                    </dl>
                </li>
            ))}
        </ul>
    );
}
