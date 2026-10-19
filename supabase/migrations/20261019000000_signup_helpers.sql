-- =====================================================================
-- Apoio ao cadastro: RPCs chamáveis SEM login (anon).
-- Retornam só um boolean / o nome da edição, nunca dados de perfis.
-- =====================================================================

-- username livre? (contas desativadas continuam ocupando o username,
-- porque o índice único em lower(username) também as considera)
create or replace function public.is_username_available(p_username text)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select not exists (
    select 1 from public.profiles
     where lower(username) = lower(trim(p_username))
  );
$$;

-- nome da edição se o código for válido (mesmas regras do join_edition), senão null
create or replace function public.check_access_code(p_access_code text)
returns text
language sql stable security definer set search_path = ''
as $$
  select name from public.editions
   where access_code = trim(p_access_code)
     and status in ('planning', 'active');
$$;

revoke execute on function
  public.is_username_available(text), public.check_access_code(text)
  from public;

grant execute on function
  public.is_username_available(text), public.check_access_code(text)
  to anon, authenticated;