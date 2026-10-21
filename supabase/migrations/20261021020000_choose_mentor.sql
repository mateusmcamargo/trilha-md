-- =====================================================================
-- Escolher tutora: a mentorada logada define a tutora responsável da
-- própria matrícula ativa que ainda não tem tutora.
--
-- RPC porque a mentorada não tem policy de update em enrollments. Só dá
-- para escolher uma tutora ativa e só enquanto a matrícula não tem tutora
-- (a troca depois disso fica com a tutora, via release_mentee).
-- =====================================================================

create or replace function public.choose_mentor(p_mentor_id uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if public.get_my_role() is distinct from 'mentee' then
    raise exception 'apenas mentoradas podem escolher tutora' using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.profiles
     where id = p_mentor_id and role = 'mentor' and deleted_at is null
  ) then
    raise exception 'tutora não encontrada' using errcode = '42501';
  end if;

  update public.enrollments
     set mentor_id = p_mentor_id
   where mentee_id = auth.uid()
     and status = 'active'
     and mentor_id is null;

  if not found then
    raise exception 'matrícula já tem tutora' using errcode = 'P0002';
  end if;
end;
$$;

revoke execute on function public.choose_mentor(uuid) from public, anon;
grant execute on function public.choose_mentor(uuid) to authenticated;
