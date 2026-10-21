-- Mais contas de teste (ver USERS.md): 2 mentoras e 8 mentoradas, todas com senha 123456.
-- Mesmo padrão de 20261018000000_seed_default_users.sql: idempotente e "o seed vence".
-- Depende da edição "Dandelion" (código MD2026) criada por aquele seed.
--
-- Matrículas na Dandelion, para exercitar a tela /team/mentees:
--   com mentora: Beatriz (Maria), Larissa (Juliana), Micaela (Carla)
--   sem mentora (dá para adotar): Rebeca, Sofia, Helena, Yasmin
--   sem trilha: Clara


do $$
declare
  u          record;
  v_id       uuid;
  v_edition  uuid;
  v_old_path text := current_setting('search_path');
begin
  -- garante crypt()/gen_salt() (pgcrypto fica no schema "extensions" no Supabase)
  perform set_config('search_path', 'extensions, public', true);

  -- ---------------------------------------------------------------------
  -- 1. Contas (mentoras primeiro: as matrículas abaixo apontam para elas)
  -- ---------------------------------------------------------------------

  for u in
    select * from (values
      ('juliana@meninasdigitais.com', 'juliana.rocha',   'Juliana Rocha',   'mentor'),
      ('carla@meninasdigitais.com',   'carla.mendes',    'Carla Mendes',    'mentor'),
      ('beatriz@meninasdigitais.com', 'beatriz.lima',    'Beatriz Lima',    'mentee'),
      ('larissa@meninasdigitais.com', 'larissa.souza',   'Larissa Souza',   'mentee'),
      ('micaela@meninasdigitais.com', 'micaela.duarte',  'Micaela Duarte',  'mentee'),
      ('rebeca@meninasdigitais.com',  'rebeca.alves',    'Rebeca Alves',    'mentee'),
      ('sofia@meninasdigitais.com',   'sofia.martins',   'Sofia Martins',   'mentee'),
      ('helena@meninasdigitais.com',  'helena.costa',    'Helena Costa',    'mentee'),
      ('yasmin@meninasdigitais.com',  'yasmin.oliveira', 'Yasmin Oliveira', 'mentee'),
      ('clara@meninasdigitais.com',   'clara.nogueira',  'Clara Nogueira',  'mentee')
    ) as t(email, username, full_name, role)
  loop
    select id into v_id from auth.users where lower(email) = u.email;

    -- libera o username caso outra conta já o use (antes do insert em auth.users:
    -- o trigger de cadastro cria o profile e estouraria a unique)
    update public.profiles
       set username = 'user' || substr(replace(id::text, '-', ''), 1, 8)
     where lower(username) = u.username
       and id is distinct from v_id;

    if v_id is null then
      -- conta nova, já confirmada. Os tokens precisam ser '' (e não NULL),
      -- senão o GoTrue falha no login.
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

    -- migrations rodam sem auth.uid(), então protect_profile_role permite definir o role
    insert into public.profiles (id, role, full_name, username)
    values (v_id, u.role, u.full_name, u.username)
    on conflict (id) do update
      set role = excluded.role,
          full_name = excluded.full_name,
          username = excluded.username,
          deleted_at = null;
  end loop;

  -- ---------------------------------------------------------------------
  -- 2. Matrículas na Dandelion
  -- ---------------------------------------------------------------------

  select id into v_edition from public.editions where access_code = 'MD2026';

  if v_edition is null then
    raise exception 'edição de teste MD2026 não encontrada (rode o seed_default_users antes)';
  end if;

  insert into public.enrollments (edition_id, mentee_id, mentor_id, status)
  select v_edition, mentee.id, mentor.id, 'active'
    from (values
      ('beatriz@meninasdigitais.com', 'maria@meninasdigitais.com'),
      ('larissa@meninasdigitais.com', 'juliana@meninasdigitais.com'),
      ('micaela@meninasdigitais.com', 'carla@meninasdigitais.com'),
      ('rebeca@meninasdigitais.com',  null),
      ('sofia@meninasdigitais.com',   null),
      ('helena@meninasdigitais.com',  null),
      ('yasmin@meninasdigitais.com',  null)
    ) as t(mentee_email, mentor_email)
    join auth.users mentee on lower(mentee.email) = t.mentee_email
    left join auth.users mentor on lower(mentor.email) = t.mentor_email
  on conflict (edition_id, mentee_id) do update
    set mentor_id = excluded.mentor_id,
        status = 'active';

  perform set_config('search_path', v_old_path, true);
end
$$;
