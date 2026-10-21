-- =====================================================================
-- Padroniza o termo "mentora" nas mensagens de erro das RPCs (antes
-- diziam "tutora"). Só os textos mudam: lógica, errcodes e grants iguais.
-- =====================================================================

create or replace function public.adopt_mentee(p_enrollment_id uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if public.get_my_role() is distinct from 'mentor' then
    raise exception 'apenas mentoras podem adotar' using errcode = '42501';
  end if;

  update public.enrollments
     set mentor_id = auth.uid()
   where id = p_enrollment_id
     and mentor_id is null
     and status = 'active';

  if not found then
    raise exception 'mentorada já tem mentora' using errcode = 'P0002';
  end if;
end;
$$;

revoke execute on function public.adopt_mentee(uuid) from public, anon;
grant execute on function public.adopt_mentee(uuid) to authenticated;

create or replace function public.release_mentee(p_enrollment_id uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if public.get_my_role() is distinct from 'mentor' then
    raise exception 'apenas mentoras podem cancelar adoções' using errcode = '42501';
  end if;

  update public.enrollments
     set mentor_id = null
   where id = p_enrollment_id
     and mentor_id = auth.uid()
     and status = 'active';

  if not found then
    raise exception 'matrícula não é sua' using errcode = 'P0002';
  end if;
end;
$$;

revoke execute on function public.release_mentee(uuid) from public, anon;
grant execute on function public.release_mentee(uuid) to authenticated;

create or replace function public.choose_mentor(p_mentor_id uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if public.get_my_role() is distinct from 'mentee' then
    raise exception 'apenas mentoradas podem escolher mentora' using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.profiles
     where id = p_mentor_id and role = 'mentor' and deleted_at is null
  ) then
    raise exception 'mentora não encontrada' using errcode = '42501';
  end if;

  update public.enrollments
     set mentor_id = p_mentor_id
   where mentee_id = auth.uid()
     and status = 'active'
     and mentor_id is null;

  if not found then
    raise exception 'matrícula já tem mentora' using errcode = 'P0002';
  end if;
end;
$$;

revoke execute on function public.choose_mentor(uuid) from public, anon;
grant execute on function public.choose_mentor(uuid) to authenticated;

create or replace function public.list_mentee_xp()
returns table (mentee_id uuid, edition_id uuid, xp bigint)
language plpgsql stable security definer set search_path = ''
as $$
begin
  if public.get_my_role() is distinct from 'mentor' then
    raise exception 'apenas mentoras podem listar o XP' using errcode = '42501';
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
