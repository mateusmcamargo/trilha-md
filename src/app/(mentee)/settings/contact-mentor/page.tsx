import type { Metadata } from 'next';

import { Mail, UserRoundSearch } from 'lucide-react';

import { Button } from '#/components/Button/Button';
import { ContactLinks } from '#/components/Settings/ContactLinks';
import { SettingsPage } from '#/components/Settings/SettingsPage';

import { getMenteeData } from '#/utils/menteeData';
import { mockMentorContact } from '#/utils/mockData';
import { isMockMode } from '#/utils/mockMode';
import { isSkeletonPreview } from '#/utils/skeletonPreview';
import { createClient } from '#/utils/supabase/server';

import ContactMentorLoading from './loading';

import styles from '#/components/Settings/Settings.module.scss';

export const metadata: Metadata = {
    title: 'Contactar sua mentora',
};

// mentor of the active enrollment; the e-mail comes from auth.users through the RPC
async function getMentorContact() {
    if (isMockMode) return mockMentorContact;

    const supabase = await createClient();
    const { data, error } = await supabase.rpc('get_my_mentor_contact');

    if (error) throw new Error(error.message);
    return data[0] ?? null;
}

export default async function ContactMentorPage() {
    // demo mode with the data turned off
    if (await isSkeletonPreview()) return <ContactMentorLoading/>;

    const [mentor, { trail, people }] = await Promise.all([getMentorContact(), getMenteeData()]);
    const firstName = mentor?.full_name.split(' ')[0];

    return (
        <SettingsPage title='Contactar sua mentora' backHref='/settings'>
            <section className={styles.section}>
                {mentor ? (
                    <>
                        <h2>Sua mentora é a {firstName}</h2>
                        <p>
                            Mande um e-mail para a <span title={mentor.full_name}>{firstName}</span> com
                            dúvidas sobre a trilha, os minigames ou os encontros. Você também pode falar com
                            ela nos encontros presenciais.
                        </p>

                        <ContactLinks contacts={[{
                            href: `mailto:${mentor.email}`,
                            label: `E-mail da ${firstName}`,
                            detail: mentor.email,
                            icon: Mail,
                        }]}/>
                    </>
                ) : (
                    <>
                        <h2>Você ainda não tem mentora</h2>
                        <p>
                            {!trail
                                ? 'Entre em uma trilha com o código de acesso para ter uma mentora.'
                                : people.mentorChoices
                                    ? 'Escolha a sua mentora no seu perfil. Ela vai acompanhar a sua trilha.'
                                    : 'Assim que uma mentora adotar você, o contato dela aparece aqui.'}
                        </p>

                        {!trail ? (
                            <Button href='/settings/trails' variant='brand' fullWidth>Entrar em uma trilha</Button>
                        ) : people.mentorChoices && (
                            <Button href='/profile' variant='brand' icon={UserRoundSearch} fullWidth>
                                Escolher mentora
                            </Button>
                        )}
                    </>
                )}
            </section>
        </SettingsPage>
    );
}
