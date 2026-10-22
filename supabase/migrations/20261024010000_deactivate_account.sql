-- =====================================================================
-- Desativar a própria conta (soft delete): preenche profiles.deleted_at
-- e guarda o motivo, se ela quiser contar.
--
-- RPC porque deleted_at não é editável direto (ver profile_self_service).
-- O perfil some das listas e buscas; o username continua reservado.
-- =====================================================================

alter table public.profiles add column if not exists deletion_reason text;

comment on column public.profiles.deletion_reason is 'motivo opcional informado ao deletar a conta';

create or replace function public.deactivate_account(p_reason text default null)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  update public.profiles
     set deleted_at = now(),
         deletion_reason = left(nullif(trim(p_reason), ''), 1000)
   where id = auth.uid()
     and deleted_at is null;

  if not found then
    raise exception 'conta não encontrada' using errcode = 'P0002';
  end if;
end;
$$;

revoke execute on function public.deactivate_account(text) from public, anon;
grant execute on function public.deactivate_account(text) to authenticated;
