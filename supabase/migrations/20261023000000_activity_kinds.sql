-- =====================================================================
-- Atividades presenciais e à distância.
--
-- remota: minigame criado pelas mentoras; forma o caminho principal da
--         trilha (position). Conclui com uma tentativa finalizada.
-- presencial: evento (data, hora, local) pendurado em uma remota
--         (parent_id). Presença só pelo QR Code (check_in) e libera os
--         materiais.
--
-- XP passa a ser a soma de xp_entries: presenças nas presenciais + melhor
-- tentativa de cada remota.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. activities: tipo, dados do evento e branch
-- ---------------------------------------------------------------------

alter table public.activities
  add column if not exists kind text not null default 'remota',
  add column if not exists starts_at timestamptz,
  add column if not exists ends_at timestamptz,
  add column if not exists location text,
  add column if not exists parent_id uuid references public.activities (id);

-- as atividades existentes já são os nós da trilha: viram remotas
alter table public.activities drop column if exists activity_date;
alter table public.activities drop column if exists material_path;
alter table public.activities alter column position drop not null;
alter table public.activities alter column kind drop default;

alter table public.activities add constraint activities_kind_check
  check (kind in ('presencial', 'remota'));

alter table public.activities add constraint activities_kind_shape
  check (
    (kind = 'remota' and position is not null and parent_id is null and starts_at is null)
    or (kind = 'presencial' and position is null and parent_id is not null and starts_at is not null)
  );

alter table public.activities add constraint activities_ends_after_starts
  check (ends_at is null or ends_at >= starts_at);

create index if not exists idx_activities_parent on public.activities (parent_id);

comment on column public.activities.kind is 'remota (minigame, caminho principal) | presencial (evento, branch de uma remota)';
comment on column public.activities.position is 'ordem do nó remoto na trilha (1, 2, 3...); null nas presenciais';
comment on column public.activities.parent_id is 'presencial: nó remoto da mesma edição ao lado do qual ela aparece';
comment on column public.activities.points is 'remota: XP máximo (proporcional aos acertos); presencial: XP da presença';

-- o parent precisa ser uma remota da mesma edição
create or replace function public.check_activity_parent()
returns trigger
language plpgsql set search_path = ''
as $$
begin
  if new.parent_id is not null and not exists (
    select 1 from public.activities
     where id = new.parent_id and edition_id = new.edition_id and kind = 'remota'
  ) then
    raise exception 'o nó relacionado precisa ser uma atividade à distância da mesma edição' using errcode = '23514';
  end if;
  return new;
end;
$$;

drop trigger if exists activities_check_parent on public.activities;
create trigger activities_check_parent
  before insert or update of parent_id, edition_id on public.activities
  for each row execute function public.check_activity_parent();

drop policy if exists "activities_delete_mentor" on public.activities;
create policy "activities_delete_mentor" on public.activities
  for delete using (public.get_my_role() = 'mentor');


-- ---------------------------------------------------------------------
-- 2. activity_progress sai: andamento vem da tentativa em aberto
-- ---------------------------------------------------------------------

drop table if exists public.activity_progress cascade;
drop function if exists public.guard_activity_progress();


-- ---------------------------------------------------------------------
-- 3. Conteúdo das remotas
-- ---------------------------------------------------------------------

create table if not exists public.activity_items (
  id          uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities (id) on delete cascade,
  position    integer not null,
  type        text not null check (type in ('complete_codigo')),
  content     jsonb not null check (jsonb_typeof(content) = 'object'),
  created_at  timestamptz not null default now(),
  constraint activity_items_position_key unique (activity_id, position) deferrable initially immediate
);

comment on table public.activity_items is 'Itens (perguntas) de uma remota. content é a parte pública; a resposta fica em activity_item_solutions';

create table if not exists public.activity_item_solutions (
  item_id     uuid primary key references public.activity_items (id) on delete cascade,
  solution    jsonb not null check (jsonb_typeof(solution) = 'object'),
  explanation text
);

comment on table public.activity_item_solutions is 'Só mentoras leem. A mentorada recebe a solução apenas por check_answer, depois de responder';

create table if not exists public.attempts (
  id            uuid primary key default gen_random_uuid(),
  activity_id   uuid not null references public.activities (id) on delete cascade,
  mentee_id     uuid not null references public.profiles (id) on delete cascade,
  started_at    timestamptz not null default now(),
  finished_at   timestamptz,
  correct_count integer,
  total_count   integer,
  xp            integer
);

create index if not exists attempts_mentee_activity_idx on public.attempts (mentee_id, activity_id);
-- no máximo uma tentativa em aberto por atividade
create unique index if not exists attempts_one_open_key
  on public.attempts (mentee_id, activity_id) where finished_at is null;

create table if not exists public.attempt_answers (
  attempt_id  uuid not null references public.attempts (id) on delete cascade,
  item_id     uuid not null references public.activity_items (id) on delete cascade,
  answer      jsonb not null,
  is_correct  boolean not null,
  answered_at timestamptz not null default now(),
  primary key (attempt_id, item_id)
);


-- ---------------------------------------------------------------------
-- 4. Presenciais: materiais e códigos de check-in
-- ---------------------------------------------------------------------

create table if not exists public.activity_materials (
  id           uuid primary key default gen_random_uuid(),
  activity_id  uuid not null references public.activities (id) on delete cascade,
  position     integer not null default 0,
  kind         text not null check (kind in ('pdf', 'link', 'texto')),
  title        text not null,
  url          text,
  storage_path text,
  body         text,
  created_at   timestamptz not null default now(),
  check (
    (kind = 'pdf' and storage_path is not null)
    or (kind = 'link' and url is not null)
    or (kind = 'texto' and body is not null)
  )
);

create index if not exists activity_materials_activity_idx on public.activity_materials (activity_id);

comment on column public.activity_materials.storage_path is 'pdf: caminho no bucket privado "materials" (<activity_id>/<arquivo>)';

create table if not exists public.checkin_codes (
  activity_id uuid primary key references public.activities (id) on delete cascade,
  code        text not null unique,
  expires_at  timestamptz not null
);

comment on table public.checkin_codes is 'Código do QR de presença. Só mentoras leem; a mentorada usa check_in';

-- presença só entra por check_in
drop policy if exists "attendance_insert_mentee_self" on public.attendance;


-- ---------------------------------------------------------------------
-- 5. Funções auxiliares
-- ---------------------------------------------------------------------

-- mentora ou mentorada presente lê os materiais (texto para servir ao Storage)
create or replace function public.can_read_material(p_activity_id text)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select public.get_my_role() = 'mentor'
      or exists (
        select 1 from public.attendance
         where activity_id::text = p_activity_id
           and mentee_id = auth.uid()
           and status = 'presente'
      );
$$;

-- ofensiva: mesma regra do touch_streak, para quem conclui uma remota
create or replace function public.bump_streak(p_profile_id uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_today date := (now() at time zone 'America/Sao_Paulo')::date;
begin
  update public.user_stats
     set streak_days = case
           when last_active_on = v_today     then streak_days
           when last_active_on = v_today - 1 then streak_days + 1
           else 1
         end,
         last_active_on = v_today
   where profile_id = p_profile_id;
end;
$$;


-- ---------------------------------------------------------------------
-- 6. Permissões e RLS
-- ---------------------------------------------------------------------

revoke all on public.activity_items, public.activity_item_solutions, public.attempts,
  public.attempt_answers, public.activity_materials, public.checkin_codes
  from anon;
revoke truncate, references, trigger on public.activity_items, public.activity_item_solutions,
  public.attempts, public.attempt_answers, public.activity_materials, public.checkin_codes
  from authenticated;
-- tentativas e códigos só mudam por RPC
revoke insert, update, delete on public.attempts, public.attempt_answers, public.checkin_codes
  from authenticated;

alter table public.activity_items enable row level security;
alter table public.activity_item_solutions enable row level security;
alter table public.attempts enable row level security;
alter table public.attempt_answers enable row level security;
alter table public.activity_materials enable row level security;
alter table public.checkin_codes enable row level security;

-- itens: mentoras gerenciam; mentorada matriculada lê
create policy activity_items_select on public.activity_items
  for select to authenticated
  using (public.get_my_role() = 'mentor' or public.is_enrolled_in_activity(activity_id));

create policy activity_items_write_mentor on public.activity_items
  for all to authenticated
  using (public.get_my_role() = 'mentor')
  with check (public.get_my_role() = 'mentor');

-- soluções: só mentoras
create policy activity_item_solutions_mentor on public.activity_item_solutions
  for all to authenticated
  using (public.get_my_role() = 'mentor')
  with check (public.get_my_role() = 'mentor');

-- tentativas: a própria mentorada ou a mentora responsável
create policy attempts_select on public.attempts
  for select to authenticated
  using (mentee_id = (select auth.uid()) or public.is_mentor_of(mentee_id));

create policy attempt_answers_select on public.attempt_answers
  for select to authenticated
  using (exists (
    select 1 from public.attempts t
     where t.id = attempt_id
       and (t.mentee_id = (select auth.uid()) or public.is_mentor_of(t.mentee_id))
  ));

-- materiais: mentoras gerenciam; mentorada lê depois da presença
create policy activity_materials_select on public.activity_materials
  for select to authenticated
  using (public.can_read_material(activity_id::text));

create policy activity_materials_write_mentor on public.activity_materials
  for all to authenticated
  using (public.get_my_role() = 'mentor')
  with check (public.get_my_role() = 'mentor');

create policy checkin_codes_select_mentor on public.checkin_codes
  for select to authenticated
  using (public.get_my_role() = 'mentor');

-- bucket de materiais: <activity_id>/<arquivo>
insert into storage.buckets (id, name, public)
values ('materials', 'materials', false)
on conflict (id) do nothing;

create policy "materials_select" on storage.objects
  for select using (
    bucket_id = 'materials' and public.can_read_material((storage.foldername(name))[1])
  );

create policy "materials_insert_mentor" on storage.objects
  for insert with check (bucket_id = 'materials' and public.get_my_role() = 'mentor');

create policy "materials_update_mentor" on storage.objects
  for update using (bucket_id = 'materials' and public.get_my_role() = 'mentor');

create policy "materials_delete_mentor" on storage.objects
  for delete using (bucket_id = 'materials' and public.get_my_role() = 'mentor');


-- ---------------------------------------------------------------------
-- 7. XP unificado
-- ---------------------------------------------------------------------

-- security_invoker: quem lê só vê as linhas que o RLS de attendance e
-- attempts libera. As RPCs (security definer) leem tudo.
create or replace view public.xp_entries with (security_invoker = true) as
  select t.mentee_id, a.edition_id, a.id as activity_id,
         a.points::bigint as xp,
         coalesce(t.checked_in_at, a.starts_at) as earned_at
    from public.attendance t
    join public.activities a on a.id = t.activity_id
   where t.status = 'presente' and a.kind = 'presencial'
  union all
  select b.mentee_id, b.edition_id, b.activity_id, b.xp, b.earned_at
    from (
      select distinct on (at.mentee_id, at.activity_id)
             at.mentee_id, a.edition_id, at.activity_id,
             at.xp::bigint as xp, at.finished_at as earned_at
        from public.attempts at
        join public.activities a on a.id = at.activity_id
       where at.finished_at is not null
       order by at.mentee_id, at.activity_id, at.xp desc, at.finished_at
    ) b;

comment on view public.xp_entries is 'Fonte única do XP: presenças nas presenciais + melhor tentativa de cada remota';

revoke all on public.xp_entries from anon;
grant select on public.xp_entries to authenticated;

create or replace function public.list_mentee_xp()
returns table (mentee_id uuid, edition_id uuid, xp bigint)
language plpgsql stable security definer set search_path = ''
as $$
begin
  if public.get_my_role() is distinct from 'mentor' then
    raise exception 'apenas mentoras podem listar o XP' using errcode = '42501';
  end if;

  return query
    select x.mentee_id, x.edition_id, coalesce(sum(x.xp), 0)::bigint
      from public.xp_entries x
     group by x.mentee_id, x.edition_id;
end;
$$;

create or replace function public.list_friends()
returns table (friendship_id uuid, id uuid, full_name text, username text, total_xp bigint)
language sql stable security definer set search_path = ''
as $$
  select f.id, p.id, p.full_name, p.username,
         coalesce((
           select sum(x.xp) from public.xp_entries x where x.mentee_id = p.id
         ), 0)::bigint as total_xp
    from public.friendships f
    join public.profiles p
      on p.id = case when f.requester_id = auth.uid() then f.addressee_id else f.requester_id end
   where f.status = 'accepted'
     and auth.uid() in (f.requester_id, f.addressee_id)
     and p.deleted_at is null
   order by total_xp desc, p.full_name;
$$;


-- ---------------------------------------------------------------------
-- 8. RPCs das remotas (mentorada)
-- ---------------------------------------------------------------------

-- abre uma tentativa ou devolve a que está em aberto
create or replace function public.start_attempt(p_activity_id uuid)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  v_id uuid;
begin
  if not exists (
    select 1 from public.activities where id = p_activity_id and kind = 'remota'
  ) or not public.is_enrolled_in_activity(p_activity_id) then
    raise exception 'atividade não encontrada' using errcode = 'P0002';
  end if;

  select id into v_id from public.attempts
   where activity_id = p_activity_id and mentee_id = auth.uid() and finished_at is null;

  if v_id is null then
    insert into public.attempts (activity_id, mentee_id)
    values (p_activity_id, auth.uid())
    returning id into v_id;
  end if;

  return v_id;
end;
$$;

-- corrige um item; a primeira resposta de cada item é a que vale
create or replace function public.check_answer(p_attempt_id uuid, p_item_id uuid, p_answer jsonb)
returns table (is_correct boolean, solution jsonb, explanation text)
language plpgsql security definer set search_path = ''
as $$
#variable_conflict use_column
declare
  v_solution    jsonb;
  v_explanation text;
begin
  if not exists (
    select 1
      from public.attempts t
      join public.activity_items i on i.activity_id = t.activity_id
     where t.id = p_attempt_id and t.mentee_id = auth.uid()
       and t.finished_at is null and i.id = p_item_id
  ) then
    raise exception 'tentativa ou item inválido' using errcode = 'P0002';
  end if;

  select s.solution, s.explanation into v_solution, v_explanation
    from public.activity_item_solutions s where s.item_id = p_item_id;

  insert into public.attempt_answers (attempt_id, item_id, answer, is_correct)
  values (p_attempt_id, p_item_id, p_answer, coalesce(p_answer = v_solution, false))
  on conflict (attempt_id, item_id) do nothing;

  return query
    select a.is_correct, v_solution, v_explanation
      from public.attempt_answers a
     where a.attempt_id = p_attempt_id and a.item_id = p_item_id;
end;
$$;

-- fecha a tentativa: nota pelos acertos e XP proporcional
create or replace function public.finish_attempt(p_attempt_id uuid)
returns table (correct integer, total integer, xp integer)
language plpgsql security definer set search_path = ''
as $$
#variable_conflict use_column
declare
  v_activity uuid;
  v_points   integer;
  v_total    integer;
  v_answered integer;
  v_correct  integer;
  v_xp       integer;
begin
  select t.activity_id, a.points into v_activity, v_points
    from public.attempts t
    join public.activities a on a.id = t.activity_id
   where t.id = p_attempt_id and t.mentee_id = auth.uid() and t.finished_at is null;

  if v_activity is null then
    raise exception 'tentativa não encontrada' using errcode = 'P0002';
  end if;

  select count(*) into v_total from public.activity_items where activity_id = v_activity;
  select count(*), count(*) filter (where is_correct) into v_answered, v_correct
    from public.attempt_answers where attempt_id = p_attempt_id;

  if v_total = 0 or v_answered < v_total then
    raise exception 'responda todos os itens antes de terminar' using errcode = '23514';
  end if;

  v_xp := round(v_points * v_correct::numeric / v_total);

  update public.attempts
     set finished_at = now(), correct_count = v_correct, total_count = v_total, xp = v_xp
   where id = p_attempt_id;

  perform public.bump_streak(auth.uid());

  return query select v_correct, v_total, v_xp;
end;
$$;


-- ---------------------------------------------------------------------
-- 9. RPCs das presenciais
-- ---------------------------------------------------------------------

-- mentora gera (ou renova) o código do QR
create or replace function public.open_checkin(p_activity_id uuid, p_minutes integer default 30)
returns table (code text, expires_at timestamptz)
language plpgsql security definer set search_path = ''
as $$
#variable_conflict use_column
declare
  v_code text := substr(replace(gen_random_uuid()::text, '-', ''), 1, 12);
begin
  if public.get_my_role() is distinct from 'mentor' then
    raise exception 'apenas mentoras podem abrir o check-in' using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.activities where id = p_activity_id and kind = 'presencial'
  ) then
    raise exception 'atividade presencial não encontrada' using errcode = 'P0002';
  end if;

  return query
    insert into public.checkin_codes as c (activity_id, code, expires_at)
    values (p_activity_id, v_code, now() + make_interval(mins => greatest(1, least(p_minutes, 240))))
    on conflict (activity_id) do update
      set code = excluded.code, expires_at = excluded.expires_at
    returning c.code, c.expires_at;
end;
$$;

-- mentorada confirma presença pelo código do QR
create or replace function public.check_in(p_code text)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  v_activity uuid;
begin
  select c.activity_id into v_activity
    from public.checkin_codes c
   where c.code = trim(p_code) and c.expires_at > now();

  if v_activity is null then
    raise exception 'código inválido ou vencido' using errcode = 'P0002';
  end if;

  if not public.is_enrolled_in_activity(v_activity) then
    raise exception 'você não está matriculada nesta edição' using errcode = '42501';
  end if;

  -- o trigger touch_streak conta a ofensiva (auth.uid() é a mentorada)
  insert into public.attendance (activity_id, mentee_id, status)
  values (v_activity, auth.uid(), 'presente')
  on conflict (activity_id, mentee_id) do update
    set status = 'presente', checked_in_at = now()
    where public.attendance.status <> 'presente';

  return v_activity;
end;
$$;


-- ---------------------------------------------------------------------
-- 10. RPCs do criador (mentora)
-- ---------------------------------------------------------------------

-- grava item e solução juntos; p_item_id null cria no fim da lista
create or replace function public.save_activity_item(
  p_activity_id uuid,
  p_item_id uuid,
  p_type text,
  p_content jsonb,
  p_solution jsonb,
  p_explanation text
)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  v_id uuid := p_item_id;
begin
  if public.get_my_role() is distinct from 'mentor' then
    raise exception 'apenas mentoras podem editar atividades' using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.activities where id = p_activity_id and kind = 'remota'
  ) then
    raise exception 'atividade à distância não encontrada' using errcode = 'P0002';
  end if;

  if v_id is null then
    insert into public.activity_items (activity_id, position, type, content)
    values (
      p_activity_id,
      coalesce((select max(position) from public.activity_items where activity_id = p_activity_id), 0) + 1,
      p_type,
      p_content
    )
    returning id into v_id;
  else
    update public.activity_items
       set type = p_type, content = p_content
     where id = v_id and activity_id = p_activity_id;
    if not found then
      raise exception 'item não encontrado' using errcode = 'P0002';
    end if;
  end if;

  insert into public.activity_item_solutions (item_id, solution, explanation)
  values (v_id, p_solution, nullif(trim(p_explanation), ''))
  on conflict (item_id) do update
    set solution = excluded.solution, explanation = excluded.explanation;

  return v_id;
end;
$$;

-- reordena itens de uma remota (lista completa de ids, na nova ordem)
create or replace function public.reorder_activity_items(p_activity_id uuid, p_item_ids uuid[])
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if public.get_my_role() is distinct from 'mentor' then
    raise exception 'apenas mentoras podem editar atividades' using errcode = '42501';
  end if;

  set constraints public.activity_items_position_key deferred;

  update public.activity_items i
     set position = o.ord
    from unnest(p_item_ids) with ordinality as o(id, ord)
   where i.id = o.id and i.activity_id = p_activity_id;
end;
$$;

-- reordena as remotas de uma edição (lista completa de ids, na nova ordem)
create or replace function public.reorder_activities(p_edition_id uuid, p_activity_ids uuid[])
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if public.get_my_role() is distinct from 'mentor' then
    raise exception 'apenas mentoras podem editar atividades' using errcode = '42501';
  end if;

  set constraints public.activities_edition_position_key deferred;

  update public.activities a
     set position = o.ord
    from unnest(p_activity_ids) with ordinality as o(id, ord)
   where a.id = o.id and a.edition_id = p_edition_id and a.kind = 'remota';
end;
$$;


revoke execute on function
  public.check_activity_parent(), public.can_read_material(text), public.bump_streak(uuid),
  public.start_attempt(uuid), public.check_answer(uuid, uuid, jsonb), public.finish_attempt(uuid),
  public.open_checkin(uuid, integer), public.check_in(text),
  public.save_activity_item(uuid, uuid, text, jsonb, jsonb, text),
  public.reorder_activity_items(uuid, uuid[]), public.reorder_activities(uuid, uuid[])
  from public, anon;

grant execute on function
  public.can_read_material(text),
  public.start_attempt(uuid), public.check_answer(uuid, uuid, jsonb), public.finish_attempt(uuid),
  public.open_checkin(uuid, integer), public.check_in(text),
  public.save_activity_item(uuid, uuid, text, jsonb, jsonb, text),
  public.reorder_activity_items(uuid, uuid[]), public.reorder_activities(uuid, uuid[])
  to authenticated;
