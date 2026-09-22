-- auto creates a row in public.profiles when a user registers via Supabase Auth.
-- all new registers are mentee
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.profiles (id, role, full_name)
    values (
        new.id,
        'mentee',
        coalesce(new.raw_user_meta_data ->> 'full_name', '')
    );
    return new;
end;
$$;

create trigger on_auth_user_created
    after insert on auth.users
    for each row
    execute function public.handle_new_user();