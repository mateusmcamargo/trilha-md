-- =====================================================================
-- Adoção de mentorada: a tutora logada vira a mentora responsável por
-- uma matrícula ativa que ainda não tem mentora.
--
-- RPC em vez de update direto: a policy enrollments_update_mentor deixa
-- qualquer mentora alterar qualquer matrícula. Aqui só dá para adotar quem
-- não tem mentora, e duas adoções simultâneas não se sobrescrevem.
-- =====================================================================

create or replace function public.adopt_mentee(p_enrollment_id uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if public.get_my_role() is distinct from 'mentor' then
    raise exception 'apenas tutoras podem adotar' using errcode = '42501';
  end if;

  update public.enrollments
     set mentor_id = auth.uid()
   where id = p_enrollment_id
     and mentor_id is null
     and status = 'active';

  if not found then
    raise exception 'mentorada já tem tutora' using errcode = 'P0002';
  end if;
end;
$$;

revoke execute on function public.adopt_mentee(uuid) from public, anon;
grant execute on function public.adopt_mentee(uuid) to authenticated;
