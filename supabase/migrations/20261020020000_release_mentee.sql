-- =====================================================================
-- Cancelar adoção: a tutora logada deixa de ser a mentora responsável
-- por uma matrícula ativa que é dela. A matrícula volta a ficar disponível
-- para adoção.
--
-- RPC pelo mesmo motivo de adopt_mentee: a policy enrollments_update_mentor
-- deixa qualquer mentora alterar qualquer matrícula. Aqui só dá para soltar
-- uma matrícula que é da própria tutora.
-- =====================================================================

create or replace function public.release_mentee(p_enrollment_id uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if public.get_my_role() is distinct from 'mentor' then
    raise exception 'apenas tutoras podem cancelar adoções' using errcode = '42501';
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
