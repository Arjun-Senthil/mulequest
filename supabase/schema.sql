-- MuleQuest — Supabase schema
-- Run in Supabase SQL editor. Auth users live in auth.users (managed by Supabase Auth).

-- ========== PROFILES ==========
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text,
  level int not null default 1,
  xp int not null default 0,
  streak int not null default 0,
  last_active date,
  badges text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)))
  on conflict (user_id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ========== PROGRESS ==========
create table if not exists public.progress (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  chapter_id int not null,
  quest_id text not null,
  status text not null default 'in_progress' check (status in ('in_progress','completed','failed')),
  completed_at timestamptz,
  unique (user_id, quest_id)
);

-- ========== PERFORMANCE LOG ==========
create table if not exists public.performance_log (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  concept_id text,
  quiz_id text,
  attempts int not null default 1,
  score numeric,
  time_spent int, -- seconds
  failed_question_ids text[] not null default '{}',
  logged_at timestamptz not null default now()
);

-- ========== AI DIAGNOSES ==========
create table if not exists public.ai_diagnoses (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  chapter_id int,
  diagnosis text not null,
  weak_tags text[] not null default '{}',
  injected_quests jsonb not null default '[]',
  recommended_action text,
  difficulty_adjustment text,
  created_at timestamptz not null default now()
);

-- ========== INVENTORY ==========
create table if not exists public.inventory (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null,
  item_type text not null,
  unlocked_at timestamptz not null default now(),
  unique (user_id, item_id)
);

-- ========== CERT TRIALS ==========
create table if not exists public.cert_trials (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  cert_level text not null check (cert_level in ('MCD-L1','MCD-L2','MCIA')),
  score numeric not null,
  passed boolean not null,
  weak_categories text[] not null default '{}',
  attempted_at timestamptz not null default now()
);

-- ========== RLS ==========
alter table public.profiles enable row level security;
alter table public.progress enable row level security;
alter table public.performance_log enable row level security;
alter table public.ai_diagnoses enable row level security;
alter table public.inventory enable row level security;
alter table public.cert_trials enable row level security;

create policy "own profile read" on public.profiles for select using (auth.uid() = user_id);
create policy "own profile update" on public.profiles for update using (auth.uid() = user_id);
create policy "own profile insert" on public.profiles for insert with check (auth.uid() = user_id);

create policy "own progress" on public.progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own perf" on public.performance_log for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own diagnoses read" on public.ai_diagnoses for select using (auth.uid() = user_id);
create policy "own diagnoses insert" on public.ai_diagnoses for insert with check (auth.uid() = user_id);
create policy "own inventory" on public.inventory for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own trials" on public.cert_trials for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Helpful indexes
create index if not exists idx_progress_user on public.progress(user_id);
create index if not exists idx_perf_user_logged on public.performance_log(user_id, logged_at desc);
create index if not exists idx_diag_user_created on public.ai_diagnoses(user_id, created_at desc);
