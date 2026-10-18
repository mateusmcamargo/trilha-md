-- Contas de teste padrão + edição de teste (ver README > "Contas de acesso padrão")
--   maria@meninasdigitais.com / 123456  -> mentora
--   anne@meninasdigitais.com  / 123456  -> mentorada, já matriculada na edição
--   edição "Dandelion", código de acesso MD2026, com 3 atividades
--
-- Idempotente e "o seed vence": se já existir conta com o e-mail do seed, ela é
-- sobrescrita (senha, e-mail confirmado, nome, username, papel, conta reativada).
-- Se outra conta já usar um username do seed, ela é renomeada para
-- 'user' + 8 caracteres do id (padrão da v3) para liberar o nome.
-- Depende de: handle_new_user (v3), que cria profile + user_stats + user_preferences.


-- ---------------------------------------------------------------------
-- 1. Comentário da coluna editions.name (corrige o exemplo antigo da v3)
-- ---------------------------------------------------------------------

comment on column public.editions.name is 'também é o nome da trilha exibido na tela (ex.: "Dandelion")';


-- ---------------------------------------------------------------------
-- 2. join_edition idempotente
-- ---------------------------------------------------------------------
-- Antes: matrícula repetida estourava a unique (edition_id, mentee_id) com 23505.
-- Agora: se a mentee já está matriculada na edição, devolve a matrícula existente
-- (sem mudar mentora nem status). Cobre, por exemplo, a Anne digitando MD2026.

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

  -- já matriculada: devolve a matrícula existente
  select id into v_enrollment_id
    from public.enrollments
   where edition_id = v_edition_id and mentee_id = auth.uid();

  if v_enrollment_id is not null then
    return v_enrollment_id;
  end if;

  if p_mentor_id is not null and not exists (
    select 1 from public.profiles where id = p_mentor_id and role = 'mentor'
  ) then
    raise exception 'mentora inválida' using errcode = '22023';
  end if;

  insert into public.enrollments (edition_id, mentee_id, mentor_id, status)
  values (v_edition_id, auth.uid(), p_mentor_id, 'active')
  on conflict (edition_id, mentee_id) do nothing
  returning id into v_enrollment_id;

  -- corrida: outra requisição matriculou entre o select e o insert
  if v_enrollment_id is null then
    select id into v_enrollment_id
      from public.enrollments
     where edition_id = v_edition_id and mentee_id = auth.uid();
  end if;

  return v_enrollment_id;
end;
$$;

revoke execute on function public.join_edition(text, uuid) from public, anon;
grant execute on function public.join_edition(text, uuid) to authenticated;


-- ---------------------------------------------------------------------
-- 3. Contas, edição, atividades e matrícula
-- ---------------------------------------------------------------------

do $$
declare
  u          record;
  v_id       uuid;
  v_mentor   uuid;
  v_mentee   uuid;
  v_old_path text := current_setting('search_path');
begin
  -- garante crypt()/gen_salt() (pgcrypto fica no schema "extensions" no Supabase)
  perform set_config('search_path', 'extensions, public', true);

  for u in
    select * from (values
      ('maria@meninasdigitais.com', 'maria',        'Maria da Silva', 'mentor'),
      ('anne@meninasdigitais.com',  'anne07franco', 'Anne Franco',    'mentee')
    ) as t(email, username, full_name, role)
  loop
    select id into v_id from auth.users where lower(email) = u.email;

    -- libera o username caso outra conta já o use (precisa vir antes do insert em
    -- auth.users: o trigger de cadastro cria o profile e estouraria a unique)
    update public.profiles
       set username = 'user' || substr(replace(id::text, '-', ''), 1, 8)
     where lower(username) = u.username
       and id is distinct from v_id;

    if v_id is null then
      -- conta nova, já confirmada. O trigger on_auth_user_created cria o profile
      -- (mentee), user_stats e user_preferences.
      -- Os tokens precisam ser '' (e não NULL), senão o GoTrue falha no login.
      v_id := gen_random_uuid();
      insert into auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
        confirmation_token, recovery_token, email_change, email_change_token_new
      ) values (
        '00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated',
        u.email, crypt('123456', gen_salt('bf')), now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('username', u.username, 'full_name', u.full_name),
        now(), now(),
        '', '', '', ''
      );
    else
      -- conta existente: sobrescreve o que importa para o login de teste
      update auth.users
         set aud = 'authenticated',
             role = 'authenticated',
             encrypted_password = crypt('123456', gen_salt('bf')),
             email_confirmed_at = coalesce(email_confirmed_at, now()),
             banned_until = null,
             deleted_at = null,
             raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
                                 || '{"provider":"email","providers":["email"]}'::jsonb,
             raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb)
                                  || jsonb_build_object('username', u.username, 'full_name', u.full_name),
             confirmation_token = coalesce(confirmation_token, ''),
             recovery_token = coalesce(recovery_token, ''),
             email_change = coalesce(email_change, ''),
             email_change_token_new = coalesce(email_change_token_new, ''),
             updated_at = now()
       where id = v_id;
    end if;

    -- identidade de e-mail (necessária para o login com senha)
    insert into auth.identities (
      id, user_id, provider_id, provider, identity_data,
      last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(), v_id, v_id::text, 'email',
      jsonb_build_object('sub', v_id::text, 'email', u.email,
                         'email_verified', true, 'phone_verified', false),
      now(), now(), now()
    )
    on conflict (provider_id, provider) do update
      set identity_data = excluded.identity_data,
          updated_at = now();

    -- perfil: se já existe (trigger ou conta antiga), sobrescreve; reativa se estava
    -- com soft delete. Migrations rodam sem auth.uid(), então o trigger
    -- protect_profile_role permite definir o role.
    insert into public.profiles (id, role, full_name, username)
    values (v_id, u.role, u.full_name, u.username)
    on conflict (id) do update
      set role = excluded.role,
          full_name = excluded.full_name,
          username = excluded.username,
          deleted_at = null;

    if u.role = 'mentor' then
      v_mentor := v_id;
    else
      v_mentee := v_id;
    end if;
  end loop;

  -- edição de teste, criada pela mentora (se já existir com esse código, atualiza o
  -- nome/subtítulo e garante que está ativa)
  insert into public.editions (name, subtitle, access_code, start_date, status, created_by)
  values ('Dandelion', 'Como a internet funciona', 'MD2026', current_date, 'active', v_mentor)
  on conflict (access_code) do update
    set name = excluded.name,
        subtitle = excluded.subtitle,
        status = 'active';

  -- atividades da trilha (só se a edição ainda não tiver nenhuma)
  insert into public.activities (edition_id, position, title, activity_date, created_by)
  select e.id, v.pos, v.title, current_date, v_mentor
    from public.editions e,
         (values (1, 'Introdução'), (2, 'Algoritmos'), (3, 'Lógica')) as v(pos, title)
   where e.access_code = 'MD2026'
     and not exists (select 1 from public.activities a where a.edition_id = e.id);

  -- matrícula da Anne, com a Maria como mentora responsável
  insert into public.enrollments (edition_id, mentee_id, mentor_id, status)
  select e.id, v_mentee, v_mentor, 'active'
    from public.editions e
   where e.access_code = 'MD2026'
  on conflict (edition_id, mentee_id) do update
    set mentor_id = excluded.mentor_id,
        status = 'active';

  perform set_config('search_path', v_old_path, true);
end
$$;
