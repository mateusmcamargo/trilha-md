-- =====================================================================
-- Configurações: notificações, privacidade, tema "sistema", contato
-- com a mentora e denúncias de abuso.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. user_preferences: notificações, privacidade e tema "system"
-- ---------------------------------------------------------------------

alter table public.user_preferences
  add column if not exists notify_events        boolean not null default true,
  add column if not exists notify_streak        boolean not null default true,
  add column if not exists notify_trail_updates boolean not null default true,
  add column if not exists show_in_search       boolean not null default true,
  add column if not exists show_xp_to_friends   boolean not null default true;

comment on column public.user_preferences.notify_events        is 'avisar dos encontros presenciais';
comment on column public.user_preferences.notify_streak        is 'lembrar de manter a ofensiva';
comment on column public.user_preferences.notify_trail_updates is 'avisar quando houver atividade nova na trilha';
comment on column public.user_preferences.show_in_search       is 'aparecer na busca por nome de usuário';
comment on column public.user_preferences.show_xp_to_friends   is 'mostrar o XP total para as amigas';

-- "system" follows the device theme
alter table public.user_preferences drop constraint if exists user_preferences_theme_check;
alter table public.user_preferences
  add constraint user_preferences_theme_check check (theme in ('light', 'dark', 'system'));


-- ---------------------------------------------------------------------
-- 2. Busca e amigas respeitam a privacidade
-- ---------------------------------------------------------------------

-- Mesma regra de antes, sem quem desligou show_in_search.
create or replace function public.search_profiles(p_username text)
returns table (id uuid, full_name text, username text)
language sql stable security definer set search_path = ''
as $$
  select p.id, p.full_name, p.username
    from public.profiles p
    left join public.user_preferences up on up.profile_id = p.id
   where length(trim(p_username)) >= 3
     and starts_with(p.username, lower(trim(p_username)))
     and p.deleted_at is null
     and p.id <> auth.uid()
     and coalesce(up.show_in_search, true)
   order by p.username
   limit 10;
$$;

-- Mesma regra de antes; total_xp vem nulo quando a amiga escondeu o XP.
create or replace function public.list_friends()
returns table (friendship_id uuid, id uuid, full_name text, username text, total_xp bigint)
language sql stable security definer set search_path = ''
as $$
  select f.id, p.id, p.full_name, p.username,
         case when coalesce(up.show_xp_to_friends, true) then
           coalesce((
             select sum(x.xp) from public.xp_entries x where x.mentee_id = p.id
           ), 0)::bigint
         end as total_xp
    from public.friendships f
    join public.profiles p
      on p.id = case when f.requester_id = auth.uid() then f.addressee_id else f.requester_id end
    left join public.user_preferences up on up.profile_id = p.id
   where f.status = 'accepted'
     and auth.uid() in (f.requester_id, f.addressee_id)
     and p.deleted_at is null
   order by total_xp desc nulls last, p.full_name;
$$;


-- ---------------------------------------------------------------------
-- 3. Contato com a mentora da matrícula ativa
-- ---------------------------------------------------------------------

-- O e-mail fica em auth.users, que o cliente não lê. Só devolve a
-- mentora da própria matrícula ativa; sem mentora, nenhuma linha.
create or replace function public.get_my_mentor_contact()
returns table (id uuid, full_name text, email text)
language sql stable security definer set search_path = ''
as $$
  select p.id, p.full_name, u.email::text
    from public.enrollments e
    join public.profiles p on p.id = e.mentor_id
    join auth.users u on u.id = p.id
   where e.mentee_id = auth.uid()
     and e.status = 'active'
     and p.deleted_at is null
   limit 1;
$$;

revoke execute on function public.get_my_mentor_contact() from public, anon;
grant execute on function public.get_my_mentor_contact() to authenticated;


-- ---------------------------------------------------------------------
-- 4. Denúncias de abuso
-- ---------------------------------------------------------------------

create table if not exists public.abuse_reports (
  id                uuid primary key default gen_random_uuid(),
  reporter_id       uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  reported_username text check (char_length(reported_username) <= 30),
  category          text not null check (category in ('assedio', 'conteudo_improprio', 'perfil_falso', 'outro')),
  description       text not null check (char_length(trim(description)) between 10 and 2000),
  status            text not null default 'aberta' check (status in ('aberta', 'resolvida')),
  created_at        timestamptz not null default now()
);

comment on table public.abuse_reports is 'denúncias feitas pelas usuárias; qualquer mentora lê e marca como resolvida';

create index if not exists abuse_reports_created_at_idx on public.abuse_reports (created_at desc);

revoke all on public.abuse_reports from anon, authenticated;
grant select on public.abuse_reports to authenticated;
grant insert (reported_username, category, description) on public.abuse_reports to authenticated;
grant update (status) on public.abuse_reports to authenticated;

alter table public.abuse_reports enable row level security;

-- quem denuncia só cria a própria denúncia (reporter_id vem do default)
drop policy if exists abuse_reports_insert_own on public.abuse_reports;
create policy abuse_reports_insert_own on public.abuse_reports
  for insert to authenticated
  with check (reporter_id = (select auth.uid()));

-- dado de moderação: qualquer mentora lê e resolve
drop policy if exists abuse_reports_select_mentor on public.abuse_reports;
create policy abuse_reports_select_mentor on public.abuse_reports
  for select to authenticated
  using ((select public.get_my_role()) = 'mentor');

drop policy if exists abuse_reports_update_mentor on public.abuse_reports;
create policy abuse_reports_update_mentor on public.abuse_reports
  for update to authenticated
  using ((select public.get_my_role()) = 'mentor')
  with check ((select public.get_my_role()) = 'mentor');
