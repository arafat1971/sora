-- Sora core schema — Sora Dev Handoff.dc.html §3 (data model), verbatim
-- entities with Postgres types + RLS. Server truth for the client stores.

create extension if not exists pgcrypto;

-- users ---------------------------------------------------------------------
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  name_phonetic text,
  city text,
  tz text not null default 'UTC',
  voice_id text not null default 'Nova',
  created_at timestamptz not null default now()
);

-- memory_facts --------------------------------------------------------------
-- Every fact used in prompts lives here — never bury context in an opaque
-- blob. Deleting (deactivating) a fact takes effect on the next generation.
create table public.memory_facts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  kind text not null check (kind in ('person', 'place', 'struggle', 'desire', 'lifestyle', 'note')),
  text text not null,
  source text not null default 'onboarding', -- onboarding|profile|sign|system
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- goals ---------------------------------------------------------------------
create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  title text not null,
  area text,
  status text not null default 'active' check (status in ('active', 'manifested')),
  created_at timestamptz not null default now()
);

-- stories -------------------------------------------------------------------
create table public.stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  goal_id uuid references public.goals (id) on delete set null,
  title text not null,
  script_text text not null,
  script_hash text not null, -- never reuse a script hash (QA: Modify differs 100%)
  audio_url text,
  voice_id text not null,
  kind text not null check (kind in ('daily_moment', 'on_demand', 'ritual', 'letter')),
  played_count integer not null default 0,
  favorited boolean not null default false,
  created_at timestamptz not null default now()
);
create index stories_user_created_idx on public.stories (user_id, created_at desc);
create unique index stories_user_hash_idx on public.stories (user_id, script_hash);

-- affirmations --------------------------------------------------------------
create table public.affirmations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  text text not null,
  audio_url text,
  saved boolean not null default false,
  created_at timestamptz not null default now()
);

-- journal_entries ------------------------------------------------------------
-- kind: gratitude|sign|win — win => proof wall + share card; signs feed the
-- next story generation.
create table public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  kind text not null check (kind in ('gratitude', 'sign', 'win')),
  text text not null,
  photo_url text,
  goal_id uuid references public.goals (id) on delete set null,
  created_at timestamptz not null default now()
);
create index journal_user_kind_idx on public.journal_entries (user_id, kind, created_at desc);

-- streaks -------------------------------------------------------------------
create table public.streaks (
  user_id uuid primary key references public.users (id) on delete cascade,
  current integer not null default 0,
  longest integer not null default 0,
  week_bitmap integer not null default 0
);

-- subscriptions: RevenueCat webhooks write here (entitlement, trial_ends_at)
create table public.subscriptions (
  user_id uuid primary key references public.users (id) on delete cascade,
  entitlement text,
  trial_ends_at timestamptz,
  updated_at timestamptz not null default now()
);

-- Storage bucket for generated MP3s ----------------------------------------
insert into storage.buckets (id, name, public)
values ('story-audio', 'story-audio', true)
on conflict (id) do nothing;

-- RLS: own-row access everywhere -------------------------------------------
alter table public.users enable row level security;
alter table public.memory_facts enable row level security;
alter table public.goals enable row level security;
alter table public.stories enable row level security;
alter table public.affirmations enable row level security;
alter table public.journal_entries enable row level security;
alter table public.streaks enable row level security;
alter table public.subscriptions enable row level security;

create policy "own user" on public.users
  for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "own memory" on public.memory_facts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own goals" on public.goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own stories" on public.stories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own affirmations" on public.affirmations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own journal" on public.journal_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own streaks" on public.streaks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own subscription" on public.subscriptions
  for select using (auth.uid() = user_id);
