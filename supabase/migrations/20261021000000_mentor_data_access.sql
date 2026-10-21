-- =====================================================================
-- Acesso das tutoras aos dados das mentoradas.
--
-- Listagem (nome, foto, trilha, tutora, XP, ofensiva): qualquer tutora.
-- Detalhes (presenças, reflexões, certificados): só a tutora responsável
-- (is_mentor_of). Até aqui essas leituras estavam abertas a qualquer tutora.
-- =====================================================================

-- ofensiva: qualquer tutora lê
drop policy if exists user_stats_select on public.user_stats;
create policy user_stats_select on public.user_stats
  for select to authenticated
  using (profile_id = (select auth.uid()) or public.get_my_role() = 'mentor');

-- detalhes: só a tutora responsável
drop policy if exists "attendance_select_mentor" on public.attendance;
create policy "attendance_select_mentor" on public.attendance
  for select using (public.is_mentor_of(mentee_id));

drop policy if exists "reflections_select_mentor" on public.reflections;
create policy "reflections_select_mentor" on public.reflections
  for select using (public.is_mentor_of(mentee_id));

-- a signatária também precisa ler o certificado que vai assinar
drop policy if exists "certificates_select_mentor" on public.certificates;
create policy "certificates_select_mentor" on public.certificates
  for select using (public.is_mentor_of(mentee_id) or mentor_id = (select auth.uid()));

-- matrículas só mudam por RPC (adopt_mentee, release_mentee, join_edition)
drop policy if exists "enrollments_update_mentor" on public.enrollments;

-- XP de todas as mentoradas para a listagem, sem expor as presenças
create or replace function public.list_mentee_xp()
returns table (mentee_id uuid, edition_id uuid, xp bigint)
language plpgsql stable security definer set search_path = ''
as $$
begin
  if public.get_my_role() is distinct from 'mentor' then
    raise exception 'apenas tutoras podem listar o XP' using errcode = '42501';
  end if;

  return query
    select at.mentee_id, a.edition_id, coalesce(sum(a.points), 0)::bigint
      from public.attendance at
      join public.activities a on a.id = at.activity_id
     where at.status = 'presente'
     group by at.mentee_id, a.edition_id;
end;
$$;

revoke execute on function public.list_mentee_xp() from public, anon;
grant execute on function public.list_mentee_xp() to authenticated;
