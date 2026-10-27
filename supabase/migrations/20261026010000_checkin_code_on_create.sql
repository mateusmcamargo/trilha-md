-- =====================================================================
-- Check-in code is created together with the in-person event and works
-- only during the event (starts_at -> ends_at). Without ends_at, it works
-- until the end of the event day in São Paulo.
-- =====================================================================


-- validity now comes from the event dates
alter table public.checkin_codes drop column if exists expires_at;

comment on table public.checkin_codes is 'QR code of each in-person event, created with it. Only mentors read it; mentees use check_in';


-- same rule as the old open_checkin: 12 random hex characters
create or replace function public.new_checkin_code()
returns text
language sql volatile set search_path = ''
as $$
    select substr(replace(gen_random_uuid()::text, '-', ''), 1, 12);
$$;


-- every new in-person event gets its code
create or replace function public.create_checkin_code()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
    insert into public.checkin_codes (activity_id, code)
    values (new.id, public.new_checkin_code())
    on conflict (activity_id) do nothing;
    return new;
end;
$$;

drop trigger if exists activities_create_checkin_code on public.activities;
create trigger activities_create_checkin_code
    after insert on public.activities
    for each row when (new.kind = 'presencial')
    execute function public.create_checkin_code();

-- events created before this migration
insert into public.checkin_codes (activity_id, code)
select a.id, public.new_checkin_code()
  from public.activities a
 where a.kind = 'presencial'
on conflict (activity_id) do nothing;


-- the mentor no longer opens the check-in: she can only swap the code if it leaks
drop function if exists public.open_checkin(uuid, integer);

create or replace function public.renew_checkin(p_activity_id uuid)
returns text
language plpgsql security definer set search_path = ''
as $$
declare
    v_code text := public.new_checkin_code();
begin
    if public.get_my_role() is distinct from 'mentor' then
        raise exception 'apenas mentoras podem trocar o código' using errcode = '42501';
    end if;

    if not exists (
        select 1 from public.activities where id = p_activity_id and kind = 'presencial'
    ) then
        raise exception 'atividade presencial não encontrada' using errcode = 'P0002';
    end if;

    insert into public.checkin_codes (activity_id, code)
    values (p_activity_id, v_code)
    on conflict (activity_id) do update set code = excluded.code;

    return v_code;
end;
$$;


-- mentee confirms presence with the QR code, only while the event happens
-- errors: P0002 unknown code, CK001 not started (or no date), CK002 already over, 42501 not enrolled
create or replace function public.check_in(p_code text)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
    v_activity uuid;
    v_starts   timestamptz;
    v_ends     timestamptz;
begin
    select c.activity_id, a.starts_at, a.ends_at
      into v_activity, v_starts, v_ends
      from public.checkin_codes c
      join public.activities a on a.id = c.activity_id
     where c.code = trim(p_code);

    if v_activity is null then
        raise exception 'código inválido' using errcode = 'P0002';
    end if;

    if v_starts is null or now() < v_starts then
        raise exception 'o encontro ainda não começou' using errcode = 'CK001';
    end if;

    -- no end time: until midnight of the event day in São Paulo
    v_ends := coalesce(
        v_ends,
        (date_trunc('day', v_starts at time zone 'America/Sao_Paulo') + interval '1 day')
            at time zone 'America/Sao_Paulo'
    );

    if now() > v_ends then
        raise exception 'o encontro já terminou' using errcode = 'CK002';
    end if;

    if not public.is_enrolled_in_activity(v_activity) then
        raise exception 'você não está matriculada nesta edição' using errcode = '42501';
    end if;

    -- the touch_streak trigger counts the streak (auth.uid() is the mentee)
    insert into public.attendance (activity_id, mentee_id, status)
    values (v_activity, auth.uid(), 'presente')
    on conflict (activity_id, mentee_id) do update
        set status = 'presente', checked_in_at = now()
        where public.attendance.status <> 'presente';

    return v_activity;
end;
$$;


revoke execute on function
    public.new_checkin_code(), public.create_checkin_code(), public.renew_checkin(uuid), public.check_in(text)
    from public, anon;

grant execute on function public.renew_checkin(uuid), public.check_in(text) to authenticated;
