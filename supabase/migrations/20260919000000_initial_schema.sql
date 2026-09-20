-- Meninas Digitais UTFPR-CP — Acompanhamento da Tutoria de Meninas
-- Migration inicial: schema completo do MVP (profiles com avatar, editions, teams,
-- enrollments com mentora responsável, activities, attendance, reflections com
-- avaliação, certificates assináveis) + RLS + bucket de Storage para avatares.

create extension if not exists "pgcrypto";

-- =========================================================
-- 1. profiles — estende auth.users com o papel do usuário
-- =========================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('mentor', 'mentee', 'admin')),
  full_name text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

comment on column public.profiles.avatar_url is 'Caminho público do arquivo no bucket de Storage "avatars" (Supabase não guarda foto de perfil nativamente).';

comment on table public.profiles is 'Uma linha por usuário autenticado. role: mentor (interna), mentee (externa) ou admin (reservado, ainda sem uso nas policies deste MVP — tratado como mentor por enquanto).';

-- Função auxiliar para checar o papel do usuário logado.
-- security definer evita recursão de RLS ao ser usada dentro de policies de profiles.
create or replace function public.get_my_role()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- =========================================================
-- 2. editions — Edição/ciclo do programa (ex: "2026.1")
-- =========================================================
create table if not exists public.editions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  access_code text not null unique,
  start_date date not null,
  end_date date,
  status text not null default 'planning' check (status in ('planning', 'active', 'completed')),
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

comment on column public.editions.access_code is 'Código usado pela mentee para se matricular sozinha na edição.';

-- =========================================================
-- 3. teams — Equipe de mentees dentro de uma edição (ex: grupo Technovation)
-- =========================================================
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  edition_id uuid not null references public.editions(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (edition_id, name)
);

-- =========================================================
-- 4. enrollments — matrícula da mentee em uma edição, com mentora e equipe
-- =========================================================
create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  edition_id uuid not null references public.editions(id) on delete cascade,
  mentee_id uuid not null references public.profiles(id) on delete cascade,
  mentor_id uuid references public.profiles(id) on delete set null,
  team_id uuid references public.teams(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'active', 'completed', 'dropped')),
  enrolled_at timestamptz not null default now(),
  unique (edition_id, mentee_id)
);

comment on column public.enrollments.mentor_id is 'Mentora responsável por esta mentee nesta edição. A mentee pode escolher na matrícula (deve ser um profile role=mentor); se ficar em branco, uma mentora se voluntaria depois ou a responsável do projeto atribui.';

-- =========================================================
-- 5. activities — Atividade dentro de uma edição
-- =========================================================
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  edition_id uuid not null references public.editions(id) on delete cascade,
  title text not null,
  description text,
  activity_date date not null,
  points integer not null default 10,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

-- =========================================================
-- 6. attendance — Presença da mentee em uma atividade
-- =========================================================
create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities(id) on delete cascade,
  mentee_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'presente' check (status in ('presente', 'falta', 'justificada')),
  checked_in_at timestamptz default now(),
  confirmed_by uuid references public.profiles(id),
  unique (activity_id, mentee_id)
);

-- =========================================================
-- 7. reflections — Reflexão da mentee, opcionalmente ligada a uma atividade
-- =========================================================
create table if not exists public.reflections (
  id uuid primary key default gen_random_uuid(),
  mentee_id uuid not null references public.profiles(id) on delete cascade,
  activity_id uuid references public.activities(id) on delete set null,
  content text not null,
  rating smallint not null check (rating between 1 and 5),
  created_at timestamptz not null default now()
);

comment on column public.reflections.rating is 'Autoavaliação da mentee sobre a experiência, de 1 a 5.';

-- =========================================================
-- 8. certificates — Certificado emitido ao final de uma edição, assinado pela mentora
-- =========================================================
create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  mentee_id uuid not null references public.profiles(id) on delete cascade,
  edition_id uuid not null references public.editions(id) on delete cascade,
  mentor_id uuid not null references public.profiles(id),
  certificate_code text not null unique,
  status text not null default 'pending_signature' check (status in ('pending_signature', 'signed')),
  generated_at timestamptz not null default now(),
  signed_at timestamptz,
  file_url text,
  unique (mentee_id, edition_id)
);

comment on column public.certificates.mentor_id is 'Mentora responsável por assinar o certificado — normalmente a mentora atribuída na matrícula.';
comment on column public.certificates.status is 'pending_signature até a mentora assinar; signed depois de signed_at ser preenchido.';

-- =========================================================
-- Índices de apoio para as consultas mais comuns
-- =========================================================
create index if not exists idx_teams_edition on public.teams(edition_id);
create index if not exists idx_enrollments_mentee on public.enrollments(mentee_id);
create index if not exists idx_enrollments_edition on public.enrollments(edition_id);
create index if not exists idx_enrollments_team on public.enrollments(team_id);
create index if not exists idx_enrollments_mentor on public.enrollments(mentor_id);
create index if not exists idx_activities_edition on public.activities(edition_id);
create index if not exists idx_attendance_mentee on public.attendance(mentee_id);
create index if not exists idx_attendance_activity on public.attendance(activity_id);
create index if not exists idx_reflections_mentee on public.reflections(mentee_id);
create index if not exists idx_certificates_mentee on public.certificates(mentee_id);
create index if not exists idx_certificates_mentor on public.certificates(mentor_id);

-- =========================================================
-- Row Level Security
-- =========================================================
alter table public.profiles enable row level security;
alter table public.editions enable row level security;
alter table public.teams enable row level security;
alter table public.enrollments enable row level security;
alter table public.activities enable row level security;
alter table public.attendance enable row level security;
alter table public.reflections enable row level security;
alter table public.certificates enable row level security;

-- profiles: cada um lê o próprio perfil; mentor lê todos
create policy "profiles_select_own_or_mentor" on public.profiles
  for select using (id = auth.uid() or public.get_my_role() = 'mentor');

create policy "profiles_insert_own" on public.profiles
  for insert with check (id = auth.uid());

create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid());

-- editions: mentor gerencia; mentee lê as edições em que está matriculada
create policy "editions_select_mentor" on public.editions
  for select using (public.get_my_role() = 'mentor');

create policy "editions_select_enrolled_mentee" on public.editions
  for select using (
    exists (
      select 1 from public.enrollments e
      where e.edition_id = editions.id and e.mentee_id = auth.uid()
    )
  );

create policy "editions_insert_mentor" on public.editions
  for insert with check (public.get_my_role() = 'mentor');

create policy "editions_update_mentor" on public.editions
  for update using (public.get_my_role() = 'mentor');

-- teams: mentor gerencia; mentee lê a equipe de edições em que está matriculada
create policy "teams_select_mentor" on public.teams
  for select using (public.get_my_role() = 'mentor');

create policy "teams_select_enrolled_mentee" on public.teams
  for select using (
    exists (
      select 1 from public.enrollments e
      where e.edition_id = teams.edition_id and e.mentee_id = auth.uid()
    )
  );

create policy "teams_insert_mentor" on public.teams
  for insert with check (public.get_my_role() = 'mentor');

create policy "teams_update_mentor" on public.teams
  for update using (public.get_my_role() = 'mentor');

-- enrollments: mentor gerencia tudo; mentee vê e cria a própria matrícula
create policy "enrollments_select_mentor" on public.enrollments
  for select using (public.get_my_role() = 'mentor');

create policy "enrollments_select_own_mentee" on public.enrollments
  for select using (mentee_id = auth.uid());

-- a mentee pode escolher uma mentora da lista de mentoras disponíveis ao se
-- matricular; se não escolher (mentor_id null), a mentora se voluntaria depois
-- ou a responsável do projeto atribui (via enrollments_update_mentor)
create policy "enrollments_insert_mentee_self" on public.enrollments
  for insert with check (
    mentee_id = auth.uid()
    and team_id is null
    and (
      mentor_id is null
      or exists (
        select 1 from public.profiles p
        where p.id = mentor_id and p.role = 'mentor'
      )
    )
  );

create policy "enrollments_update_mentor" on public.enrollments
  for update using (public.get_my_role() = 'mentor');

-- activities: mentor gerencia; mentee lê atividades das edições em que está matriculada
create policy "activities_select_mentor" on public.activities
  for select using (public.get_my_role() = 'mentor');

create policy "activities_select_enrolled_mentee" on public.activities
  for select using (
    exists (
      select 1 from public.enrollments e
      where e.edition_id = activities.edition_id and e.mentee_id = auth.uid()
    )
  );

create policy "activities_insert_mentor" on public.activities
  for insert with check (public.get_my_role() = 'mentor');

create policy "activities_update_mentor" on public.activities
  for update using (public.get_my_role() = 'mentor');

-- attendance: mentor gerencia tudo; mentee vê e registra o próprio check-in
create policy "attendance_select_mentor" on public.attendance
  for select using (public.get_my_role() = 'mentor');

create policy "attendance_select_own_mentee" on public.attendance
  for select using (mentee_id = auth.uid());

create policy "attendance_insert_mentee_self" on public.attendance
  for insert with check (mentee_id = auth.uid());

create policy "attendance_update_mentor" on public.attendance
  for update using (public.get_my_role() = 'mentor');

-- reflections: mentee tem controle total das próprias; mentor só lê
create policy "reflections_select_mentor" on public.reflections
  for select using (public.get_my_role() = 'mentor');

create policy "reflections_all_own_mentee" on public.reflections
  for all using (mentee_id = auth.uid()) with check (mentee_id = auth.uid());

-- certificates: mentor emite; mentee só lê os próprios
create policy "certificates_select_mentor" on public.certificates
  for select using (public.get_my_role() = 'mentor');

create policy "certificates_select_own_mentee" on public.certificates
  for select using (mentee_id = auth.uid());

create policy "certificates_insert_mentor" on public.certificates
  for insert with check (public.get_my_role() = 'mentor');

-- só a mentora atribuída como signatária pode assinar (atualizar status/signed_at/file_url)
create policy "certificates_update_own_mentor" on public.certificates
  for update using (mentor_id = auth.uid()) with check (mentor_id = auth.uid());

-- =========================================================
-- Storage — bucket para fotos de perfil
-- =========================================================
-- Convenção de caminho: avatars/{user_id}/qualquer-nome.ext
-- Isso permite restringir cada usuário à própria pasta usando o primeiro
-- segmento do path (storage.foldername(name)) nas policies abaixo.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatar_public_read" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "avatar_insert_own_folder" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatar_update_own_folder" on storage.objects
  for update using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatar_delete_own_folder" on storage.objects
  for delete using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );
