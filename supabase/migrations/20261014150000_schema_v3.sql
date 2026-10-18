-- =====================================================================
-- Trilha MD — migração do schema v2 para o v3
--
-- Pressupõe as tabelas da v2 (schema_2.sql) já criadas e a extensão de auth
-- do Supabase (auth.users, auth.uid()).
--
-- Antes de rodar:
--  * se o trigger de cadastro da v2 tem outro nome que não on_auth_user_created,
--    apague-o: o antigo não preenche username e quebraria o cadastro;
--  * o formulário de cadastro deve enviar username e full_name em
--    options.data (supabase.auth.signUp).
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. Alterações em tabelas existentes
-- ---------------------------------------------------------------------

-- profiles: username e soft delete
alter table public.profiles
  add column if not exists username text,
  add column if not exists deleted_at timestamptz;

update public.profiles
   set username = 'user' || substr(replace(id::text, '-', ''), 1, 8)
 where username is null;

alter table public.profiles alter column username set not null;

alter table public.profiles drop constraint if exists profiles_username_format;
alter table public.profiles add constraint profiles_username_format
  check (username ~ '^[a-z0-9._]{3,30}$');

create unique index if not exists profiles_username_lower_key
  on public.profiles (lower(username));

comment on column public.profiles.username is 'único sem diferenciar maiúsculas (índice em lower(username)); vem de raw_user_meta_data no cadastro';
comment on column public.profiles.deleted_at is 'soft delete: preenchido ao "Deletar conta"; perfil some das listas e buscas';

-- editions: subtítulo da trilha
alter table public.editions add column if not exists subtitle text;

comment on column public.editions.name is 'também é o nome da trilha exibido na tela (ex.: "Dente-de-Leão")';
comment on column public.editions.subtitle is 'subtítulo no cartão da trilha (ex.: "Como a internet funciona")';

-- activities: points agora alimenta o XP
comment on column public.activities.points is 'XP concedido ao concluir a atividade';


-- ---------------------------------------------------------------------
-- 2. Tabelas novas
-- ---------------------------------------------------------------------

create table if not exists public.user_stats (
  profile_id     uuid primary key references public.profiles (id) on delete cascade,
  streak_days    integer  not null default 0 check (streak_days >= 0),
  last_active_on date,
  lives          smallint not null default 5 check (lives >= 0)
);

comment on table public.user_stats is 'Só função/trigger altera; a mentee tem apenas SELECT. XP não fica aqui: é derivado de activities.points';
comment on column public.user_stats.streak_days is 'dias seguidos com atividade (ofensiva)';
comment on column public.user_stats.last_active_on is 'último dia com atividade; usado para zerar ou incrementar a ofensiva';
comment on column public.user_stats.lives is 'vidas; regra de perda e recuperação a definir';

create table if not exists public.user_preferences (
  profile_id             uuid primary key references public.profiles (id) on delete cascade,
  sounds_enabled         boolean not null default true,
  animations_enabled     boolean not null default true,
  funny_messages_enabled boolean not null default true,
  theme                  text    not null default 'light' check (theme in ('light', 'dark'))
);

create table if not exists public.friendships (
  id           uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles (id) on delete cascade,
  addressee_id uuid not null references public.profiles (id) on delete cascade,
  status       text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at   timestamptz not null default now(),
  check (requester_id <> addressee_id)
);

create unique index if not exists friendships_pair_key
  on public.friendships (least(requester_id, addressee_id), greatest(requester_id, addressee_id));
create index if not exists friendships_requester_id_idx on public.friendships (requester_id);
create index if not exists friendships_addressee_id_idx on public.friendships (addressee_id);

comment on column public.friendships.addressee_id is 'quem recebeu; só ela aceita, via respond_friend_request';
comment on column public.friendships.status is 'pending | accepted (recusa apaga a linha)';

create table if not exists public.activity_progress (
  id          uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities (id) on delete cascade,
  mentee_id   uuid not null references public.profiles (id) on delete cascade,
  progress    smallint not null default 0 check (progress between 0 and 100),
  mastered_at timestamptz,
  updated_at  timestamptz not null default now()
);

create unique index if not exists activity_progress_activity_mentee_key
  on public.activity_progress (activity_id, mentee_id);
create index if not exists activity_progress_mentee_id_idx on public.activity_progress (mentee_id);

comment on table public.activity_progress is 'A conclusão continua derivada de attendance; esta tabela só guarda andamento e domínio';
comment on column public.activity_progress.progress is '0 a 100; andamento dentro da atividade, exibido no anel do nó disponível';
comment on column public.activity_progress.mastered_at is 'preenchido quando a atividade é dominada; exige attendance presente (trigger)';

-- quem já tinha conta antes da v3
insert into public.user_stats (profile_id)       select id from public.profiles on conflict do nothing;
insert into public.user_preferences (profile_id) select id from public.profiles on conflict do nothing;


-- ---------------------------------------------------------------------
-- 3. Funções auxiliares (usadas nas policies)
-- ---------------------------------------------------------------------

create or replace function public.get_my_role()
returns text
language sql stable security definer set search_path = ''
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_mentor_of(p_mentee_id uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.enrollments
     where mentee_id = p_mentee_id and mentor_id = auth.uid()
  );
$$;

create or replace function public.is_enrolled_in_activity(p_activity_id uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1
      from public.activities a
      join public.enrollments e on e.edition_id = a.edition_id
     where a.id = p_activity_id and e.mentee_id = auth.uid()
  );
$$;


-- ---------------------------------------------------------------------
-- 4. Triggers
-- ---------------------------------------------------------------------

-- Cadastro: cria profile (sempre mentee), user_stats e user_preferences.
-- raw_user_meta_data vem do cliente, então o role nunca é lido dele.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, role, full_name, username)
  values (
    new.id,
    'mentee',
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'Sem nome'
    ),
    lower(coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'username'), ''),
      'user' || substr(replace(new.id::text, '-', ''), 1, 8)
    ))
  );

  insert into public.user_stats (profile_id) values (new.id);
  insert into public.user_preferences (profile_id) values (new.id);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Role imutável pelo cliente. SQL editor e service role não têm auth.uid(),
-- então a promoção manual de mentoras continua possível.
create or replace function public.protect_profile_role()
returns trigger
language plpgsql set search_path = ''
as $$
begin
  if new.role is distinct from old.role and auth.uid() is not null then
    raise exception 'o role não pode ser alterado pelo cliente' using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_role on public.profiles;
create trigger profiles_protect_role
  before update on public.profiles
  for each row execute function public.protect_profile_role();

-- Ofensiva: conta só o check-in da própria mentee (não a confirmação da mentora).
create or replace function public.touch_streak()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_today date := (now() at time zone 'America/Sao_Paulo')::date;
begin
  if new.status <> 'presente' or new.mentee_id is distinct from auth.uid() then
    return new;
  end if;

  update public.user_stats
     set streak_days = case
           when last_active_on = v_today     then streak_days
           when last_active_on = v_today - 1 then streak_days + 1
           else 1
         end,
         last_active_on = v_today
   where profile_id = new.mentee_id;

  return new;
end;
$$;

drop trigger if exists attendance_touch_streak on public.attendance;
create trigger attendance_touch_streak
  after insert or update of status on public.attendance
  for each row execute function public.touch_streak();

-- activity_progress: updated_at automático e "dominada" só se concluída.
create or replace function public.guard_activity_progress()
returns trigger
language plpgsql set search_path = ''
as $$
begin
  if new.mastered_at is not null and not exists (
    select 1 from public.attendance
     where activity_id = new.activity_id
       and mentee_id = new.mentee_id
       and status = 'presente'
  ) then
    raise exception 'a atividade precisa estar concluída para ser dominada' using errcode = '23514';
  end if;

  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists activity_progress_guard on public.activity_progress;
create trigger activity_progress_guard
  before insert or update on public.activity_progress
  for each row execute function public.guard_activity_progress();


-- ---------------------------------------------------------------------
-- 5. Funções chamadas pelo cliente (RPC)
-- ---------------------------------------------------------------------

-- Mudou na v3: ignora contas desativadas.
drop function if exists public.list_mentors();
create function public.list_mentors()
returns table (id uuid, full_name text, avatar_url text)
language sql stable security definer set search_path = ''
as $$
  select p.id, p.full_name, p.avatar_url
    from public.profiles p
   where p.role = 'mentor' and p.deleted_at is null
   order by p.full_name;
$$;

-- Busca por prefixo de username. Mínimo de 3 caracteres e limite de 10
-- resultados para dificultar listar todas as contas (há possíveis menores).
create or replace function public.search_profiles(p_username text)
returns table (id uuid, full_name text, username text)
language sql stable security definer set search_path = ''
as $$
  select p.id, p.full_name, p.username
    from public.profiles p
   where length(trim(p_username)) >= 3
     and starts_with(p.username, lower(trim(p_username)))
     and p.deleted_at is null
     and p.id <> auth.uid()
   order by p.username
   limit 10;
$$;

-- Amigas aceitas com XP total derivado (soma de activities.points das presenças).
create or replace function public.list_friends()
returns table (friendship_id uuid, id uuid, full_name text, username text, total_xp bigint)
language sql stable security definer set search_path = ''
as $$
  select f.id, p.id, p.full_name, p.username,
         coalesce((
           select sum(a.points)
             from public.attendance t
             join public.activities a on a.id = t.activity_id
            where t.mentee_id = p.id and t.status = 'presente'
         ), 0)::bigint as total_xp
    from public.friendships f
    join public.profiles p
      on p.id = case when f.requester_id = auth.uid() then f.addressee_id else f.requester_id end
   where f.status = 'accepted'
     and auth.uid() in (f.requester_id, f.addressee_id)
     and p.deleted_at is null
   order by total_xp desc, p.full_name;
$$;

-- Pedidos recebidos e ainda não respondidos.
create or replace function public.list_friend_requests()
returns table (friendship_id uuid, requester_id uuid, full_name text, username text, created_at timestamptz)
language sql stable security definer set search_path = ''
as $$
  select f.id, p.id, p.full_name, p.username, f.created_at
    from public.friendships f
    join public.profiles p on p.id = f.requester_id
   where f.addressee_id = auth.uid()
     and f.status = 'pending'
     and p.deleted_at is null
   order by f.created_at;
$$;

-- Só a destinatária responde. Aceitar muda o status; recusar apaga a linha.
create or replace function public.respond_friend_request(p_friendship_id uuid, p_accept boolean)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if p_accept then
    update public.friendships
       set status = 'accepted'
     where id = p_friendship_id and addressee_id = auth.uid() and status = 'pending';
  else
    delete from public.friendships
     where id = p_friendship_id and addressee_id = auth.uid() and status = 'pending';
  end if;

  if not found then
    raise exception 'pedido de amizade não encontrado' using errcode = 'P0002';
  end if;
end;
$$;

revoke execute on function
  public.get_my_role(), public.is_mentor_of(uuid), public.is_enrolled_in_activity(uuid),
  public.list_mentors(), public.search_profiles(text), public.list_friends(),
  public.list_friend_requests(), public.respond_friend_request(uuid, boolean),
  public.handle_new_user(), public.protect_profile_role(), public.touch_streak(),
  public.guard_activity_progress()
  from public, anon;

grant execute on function
  public.get_my_role(), public.is_mentor_of(uuid), public.is_enrolled_in_activity(uuid),
  public.list_mentors(), public.search_profiles(text), public.list_friends(),
  public.list_friend_requests(), public.respond_friend_request(uuid, boolean)
  to authenticated;


-- ---------------------------------------------------------------------
-- 6. Permissões e RLS das tabelas novas
-- ---------------------------------------------------------------------

-- RLS não protege TRUNCATE, então retiramos o que o cliente não precisa.
revoke all on public.user_stats, public.user_preferences, public.friendships, public.activity_progress
  from anon;
revoke truncate, references, trigger on public.user_stats, public.user_preferences,
  public.friendships, public.activity_progress from authenticated;
revoke insert, update, delete on public.user_stats from authenticated;
revoke insert, delete on public.user_preferences from authenticated;

alter table public.user_stats enable row level security;
alter table public.user_preferences enable row level security;
alter table public.friendships enable row level security;
alter table public.activity_progress enable row level security;

-- user_stats: a própria mentee e a mentora responsável leem; só função/trigger altera.
drop policy if exists user_stats_select on public.user_stats;
create policy user_stats_select on public.user_stats
  for select to authenticated
  using (profile_id = (select auth.uid()) or public.is_mentor_of(profile_id));

-- user_preferences: só a própria linha, só leitura e update.
drop policy if exists user_preferences_select_own on public.user_preferences;
create policy user_preferences_select_own on public.user_preferences
  for select to authenticated
  using (profile_id = (select auth.uid()));

drop policy if exists user_preferences_update_own on public.user_preferences;
create policy user_preferences_update_own on public.user_preferences
  for update to authenticated
  using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));

-- friendships: cada uma vê as amizades em que participa. Aceitar é via
-- respond_friend_request (sem policy de update).
drop policy if exists friendships_select_participant on public.friendships;
create policy friendships_select_participant on public.friendships
  for select to authenticated
  using ((select auth.uid()) in (requester_id, addressee_id));

drop policy if exists friendships_insert_requester on public.friendships;
create policy friendships_insert_requester on public.friendships
  for insert to authenticated
  with check (requester_id = (select auth.uid()) and status = 'pending');

drop policy if exists friendships_delete_participant on public.friendships;
create policy friendships_delete_participant on public.friendships
  for delete to authenticated
  using ((select auth.uid()) in (requester_id, addressee_id));

-- activity_progress: a mentee escreve o próprio andamento nas atividades da
-- edição em que está matriculada; a mentora responsável só lê.
drop policy if exists activity_progress_select on public.activity_progress;
create policy activity_progress_select on public.activity_progress
  for select to authenticated
  using (mentee_id = (select auth.uid()) or public.is_mentor_of(mentee_id));

drop policy if exists activity_progress_insert_own on public.activity_progress;
create policy activity_progress_insert_own on public.activity_progress
  for insert to authenticated
  with check (mentee_id = (select auth.uid()) and public.is_enrolled_in_activity(activity_id));

drop policy if exists activity_progress_update_own on public.activity_progress;
create policy activity_progress_update_own on public.activity_progress
  for update to authenticated
  using (mentee_id = (select auth.uid()))
  with check (mentee_id = (select auth.uid()) and public.is_enrolled_in_activity(activity_id));
