-- ─── INTAKE TRACKER ─────────────────────────────────────────────────
-- Daily food log and per user nutrition targets.
--
-- Nutrition columns hold PER SERVING values. Totals are servings * value,
-- computed in the app, so a logged recipe keeps the same unit the cookbook
-- stores. All values are estimates.
--
-- Apply with `supabase db push`, or paste into the Supabase SQL editor.

-- ─── ENTRIES ────────────────────────────────────────────────────────
create table if not exists public.intake_entries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,

  -- Local calendar day the entry belongs to, written by the client so the
  -- day rolls over at the user's midnight rather than UTC midnight.
  log_date    date not null,

  name        text not null check (char_length(trim(name)) between 1 and 120),
  servings    numeric(6, 2) not null default 1 check (servings > 0 and servings <= 99),

  -- 'recipe' rows carry the cookbook id they came from, 'manual' rows do not.
  source      text not null default 'manual' check (source in ('recipe', 'manual')),
  recipe_id   text,

  -- Macros, per serving.
  calories    numeric(8, 2) not null default 0 check (calories  >= 0),
  protein     numeric(8, 2) not null default 0 check (protein   >= 0),
  carbs       numeric(8, 2) not null default 0 check (carbs     >= 0),
  fat         numeric(8, 2) not null default 0 check (fat       >= 0),

  -- Micronutrients, per serving. Grams for fiber and sugar, mg for the rest.
  fiber       numeric(8, 2) not null default 0 check (fiber     >= 0),
  sugar       numeric(8, 2) not null default 0 check (sugar     >= 0),
  sodium      numeric(8, 2) not null default 0 check (sodium    >= 0),
  potassium   numeric(8, 2) not null default 0 check (potassium >= 0),
  calcium     numeric(8, 2) not null default 0 check (calcium   >= 0),
  iron        numeric(8, 2) not null default 0 check (iron      >= 0),
  vitamin_c   numeric(8, 2) not null default 0 check (vitamin_c >= 0),

  created_at  timestamptz not null default now()
);

-- The tracker always queries one user's single day, newest first.
create index if not exists intake_entries_user_day_idx
  on public.intake_entries (user_id, log_date, created_at desc);

-- ─── TARGETS ────────────────────────────────────────────────────────
-- One row per user. Upserted on save, so user_id is the primary key.
create table if not exists public.intake_targets (
  user_id     uuid primary key references auth.users (id) on delete cascade,

  calories    numeric(8, 2) not null default 2100 check (calories  >= 0),
  protein     numeric(8, 2) not null default 180  check (protein   >= 0),
  carbs       numeric(8, 2) not null default 180  check (carbs     >= 0),
  fat         numeric(8, 2) not null default 60   check (fat       >= 0),
  fiber       numeric(8, 2) not null default 30   check (fiber     >= 0),
  sugar       numeric(8, 2) not null default 45   check (sugar     >= 0),
  sodium      numeric(8, 2) not null default 2300 check (sodium    >= 0),
  potassium   numeric(8, 2) not null default 3400 check (potassium >= 0),
  calcium     numeric(8, 2) not null default 1000 check (calcium   >= 0),
  iron        numeric(8, 2) not null default 18   check (iron      >= 0),
  vitamin_c   numeric(8, 2) not null default 90   check (vitamin_c >= 0),

  updated_at  timestamptz not null default now()
);

-- ─── ROW LEVEL SECURITY ─────────────────────────────────────────────
-- Every row is scoped to its owner. auth.uid() is the authenticated user,
-- and it is null for the anon key, so an unauthenticated request matches
-- nothing on read and is rejected on write.
alter table public.intake_entries enable row level security;
alter table public.intake_targets enable row level security;

drop policy if exists "own entries: select" on public.intake_entries;
create policy "own entries: select" on public.intake_entries
  for select using (auth.uid() = user_id);

drop policy if exists "own entries: insert" on public.intake_entries;
create policy "own entries: insert" on public.intake_entries
  for insert with check (auth.uid() = user_id);

drop policy if exists "own entries: update" on public.intake_entries;
create policy "own entries: update" on public.intake_entries
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own entries: delete" on public.intake_entries;
create policy "own entries: delete" on public.intake_entries
  for delete using (auth.uid() = user_id);

drop policy if exists "own targets: select" on public.intake_targets;
create policy "own targets: select" on public.intake_targets
  for select using (auth.uid() = user_id);

drop policy if exists "own targets: insert" on public.intake_targets;
create policy "own targets: insert" on public.intake_targets
  for insert with check (auth.uid() = user_id);

drop policy if exists "own targets: update" on public.intake_targets;
create policy "own targets: update" on public.intake_targets
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own targets: delete" on public.intake_targets;
create policy "own targets: delete" on public.intake_targets
  for delete using (auth.uid() = user_id);
