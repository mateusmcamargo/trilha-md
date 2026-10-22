-- =====================================================================
-- Desativar a conta agora também encerra a matrícula e é só para mentoradas.
--
-- Matrículas pendentes ou ativas viram 'dropped' (o check já existente;
-- não há 'inactive'), então a mentorada deixa de contar como adotada.
-- Mentoras não se desativam: isso fica para a coordenadora.
-- =====================================================================

create or replace function public.deactivate_account(p_reason text default null)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if public.get_my_role() is distinct from 'mentee' then
    raise exception 'apenas mentoradas podem desativar a conta' using errcode = '42501';
  end if;

  update public.profiles
     set deleted_at = now(),
         deletion_reason = left(nullif(trim(p_reason), ''), 1000)
   where id = auth.uid()
     and deleted_at is null;

  if not found then
    raise exception 'conta não encontrada' using errcode = 'P0002';
  end if;

  update public.enrollments
     set status = 'dropped'
   where mentee_id = auth.uid()
     and status in ('pending', 'active');
end;
$$;
