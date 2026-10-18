-- =====================================================================
-- Ponte entre 20260919000000_initial_schema.sql e 20261014150000_schema_v3.sql
--
-- O initial_schema não é a v2 que a v3 pressupõe. Esta migration traz o banco
-- para o estado "v2" (colunas, policies, join_edition e avatares privados).
-- Deve rodar DEPOIS do trigger de cadastro (20260921) e ANTES da v3.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. Colunas que faltam
-- ---------------------------------------------------------------------

alter table public.profiles alter column role set default 'mentee';

-- activities: ordem na trilha e caminho do PDF
alter table public.activities
  add column if not exists position integer,
  add column if not exists material_path text;

-- linhas antigas recebem uma ordem pela data de criação
update public.activities a
   set position = r.rn
  from (
    select id, row_number() over (partition by edition_id order by activity_date, created_at) as rn
      from public.activities
  ) r
 where a.id = r.id and a.position is null;

alter table public.activities alter column position set not null;

-- deferrable: permite trocar posições na mesma transação ao reordenar
alter table public.activities
  add constraint activities_edition_position_key
  unique (edition_id, position) deferrable initially immediate;

comment on column public.activities.position is 'ordem do nó na trilha (1, 2, 3...); única por edição';
comment on column public.activities.material_path is 'caminho do PDF no bucket privado "materials"';

-- reflections: edição obrigatória (dashboard por edição)
alter table public.reflections
  add column if not exists edition_id uuid references public.editions (id) on delete cascade;

update public.reflections r
   set edition_id = a.edition_id
  from public.activities a
 where r.activity_id = a.id and r.edition_id is null;

-- reflexão sem atividade: usa a matrícula mais recente da mentee
update public.reflections r
   set edition_id = (
     select e.edition_id from public.enrollments e
      where e.mentee_id = r.mentee_id
      order by e.enrolled_at desc limit 1
   )
 where r.edition_id is null;

-- falha aqui se sobrar reflexão sem edição: resolva à mão e rode de novo
alter table public.reflections alter column edition_id set not null;

create index if not exists idx_reflections_edition on public.reflections (edition_id);

-- activity_id, se informado, deve pertencer a edition_id
create or replace function public.check_reflection_edition()
returns trigger
language plpgsql set search_path = ''
as $$
begin
  if new.activity_id is not null and not exists (
    select 1 from public.activities
     where id = new.activity_id and edition_id = new.edition_id
  ) then
    raise exception 'a atividade não pertence à edição informada' using errcode = '23514';
  end if;
  return new;
end;
$$;

drop trigger if exists reflections_check_edition on public.reflections;
create trigger reflections_check_edition
  before insert or update on public.reflections
  for each row execute function public.check_reflection_edition();


-- ---------------------------------------------------------------------
-- 2. Policies que o design da v2 mudou
-- ---------------------------------------------------------------------

-- a mentee só entra em uma edição via join_edition (exige o código de acesso)
drop policy if exists "enrollments_insert_mentee_self" on public.enrollments;

-- o profile é criado pelo trigger de cadastro, não pelo cliente
drop policy if exists "profiles_insert_own" on public.profiles;

-- check-in: só 'presente', sem confirmed_by, e só em atividade da edição matriculada
drop policy if exists "attendance_insert_mentee_self" on public.attendance;
create policy "attendance_insert_mentee_self" on public.attendance
  for insert with check (
    mentee_id = auth.uid()
    and status = 'presente'
    and confirmed_by is null
    and exists (
      select 1
        from public.activities a
        join public.enrollments e on e.edition_id = a.edition_id
       where a.id = activity_id and e.mentee_id = auth.uid()
    )
  );

-- reflexão: a mentee só escreve em edição em que está matriculada
drop policy if exists "reflections_all_own_mentee" on public.reflections;
create policy "reflections_all_own_mentee" on public.reflections
  for all
  using (mentee_id = auth.uid())
  with check (
    mentee_id = auth.uid()
    and exists (
      select 1 from public.enrollments e
       where e.edition_id = reflections.edition_id and e.mentee_id = auth.uid()
    )
  );

-- certificado: RLS não restringe colunas, então a assinatura não pode ser um
-- update direto. Será feita por sign_certificate (junto com a feature de certificados).
drop policy if exists "certificates_update_own_mentor" on public.certificates;


-- ---------------------------------------------------------------------
-- 3. join_edition
-- ---------------------------------------------------------------------

create or replace function public.join_edition(p_access_code text, p_mentor_id uuid default null)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  v_edition_id uuid;
  v_enrollment_id uuid;
begin
  if auth.uid() is null then
    raise exception 'não autenticada' using errcode = '42501';
  end if;

  select id into v_edition_id
    from public.editions
   where access_code = trim(p_access_code)
     and status in ('planning', 'active');

  if v_edition_id is null then
    raise exception 'código de acesso inválido' using errcode = 'P0002';
  end if;

  if p_mentor_id is not null and not exists (
    select 1 from public.profiles where id = p_mentor_id and role = 'mentor'
  ) then
    raise exception 'mentora inválida' using errcode = '22023';
  end if;

  -- matrícula repetida estoura a unique (edition_id, mentee_id) com 23505
  insert into public.enrollments (edition_id, mentee_id, mentor_id, status)
  values (v_edition_id, auth.uid(), p_mentor_id, 'active')
  returning id into v_enrollment_id;

  return v_enrollment_id;
end;
$$;

revoke execute on function public.join_edition(text, uuid) from public, anon;
grant execute on function public.join_edition(text, uuid) to authenticated;


-- ---------------------------------------------------------------------
-- 4. Avatares privados (possíveis menores de idade)
-- ---------------------------------------------------------------------
-- profiles.avatar_url passa a guardar o CAMINHO; o frontend usa createSignedUrl.

update storage.buckets set public = false where id = 'avatars';

drop policy if exists "avatar_public_read" on storage.objects;

create policy "avatar_select_own_or_mentor" on storage.objects
  for select using (
    bucket_id = 'avatars'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.get_my_role() = 'mentor'
    )
  );

comment on column public.profiles.avatar_url is 'CAMINHO no bucket privado "avatars" (não é URL pública)';
