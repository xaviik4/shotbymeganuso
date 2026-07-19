-- ─── CONTENT DASHBOARD ──────────────────────────────────────────────
-- Daily snapshots of YouTube and Instagram performance, written by the
-- Vercel cron job at /api/cron/sync.
--
-- Apply with `supabase db push`, or paste into the Supabase SQL editor.
--
-- Two things about this migration differ deliberately from the intake
-- tracker's four-policies-per-table convention. Both are called out at the
-- policy blocks below:
--   1. content_metrics is READ ONLY to the browser. Only the cron writes it,
--      using the service role, which bypasses RLS entirely.
--   2. content_accounts has NO policies at all, because it holds a secret.

-- ─── VIEWERS ────────────────────────────────────────────────────────
-- Read grants. A row here says "viewer_id may see account_user_id's numbers".
-- Created before content_metrics because that table's policy references it.
--
-- This is an explicit allowlist rather than "any authenticated user" on
-- purpose: the login is titled Client Login, so other accounts will exist
-- that must NOT see these numbers.
create table if not exists public.content_viewers (
  account_user_id uuid not null references auth.users (id) on delete cascade,
  viewer_id       uuid not null references auth.users (id) on delete cascade,
  granted_at      timestamptz not null default now(),

  primary key (account_user_id, viewer_id)
);

-- The dashboard asks "what may I see?", so the lookup is by viewer.
create index if not exists content_viewers_viewer_idx
  on public.content_viewers (viewer_id);

-- ─── METRICS ────────────────────────────────────────────────────────
-- One row per platform per day. Re-running the sync on the same day
-- overwrites that day's row rather than appending, so this table holds a
-- single end-of-day snapshot per platform.
create table if not exists public.content_metrics (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,

  -- UTC day, unlike intake_entries.log_date which is deliberately the user's
  -- local day. The writer here is a UTC cron with no browser in the loop, so
  -- there is no local timezone to honour.
  metric_date     date not null,

  platform        text not null check (platform in ('youtube', 'instagram')),

  -- bigint, not integer: a lifetime YouTube view count overflows int4 at 2.1B.
  total_views     bigint  not null default 0 check (total_views >= 0),
  followers       integer not null default 0 check (followers   >= 0),
  engagement_rate numeric(7, 2) not null default 0 check (engagement_rate >= 0),

  synced_at       timestamptz not null default now(),

  unique (user_id, metric_date, platform)
);

-- The dashboard always asks for one account's most recent N days.
create index if not exists content_metrics_user_date_idx
  on public.content_metrics (user_id, metric_date desc);

-- ─── ACCOUNTS ───────────────────────────────────────────────────────
-- One row per tracked account. The cron selects every row and loops, which
-- is how a job running with no logged-in user learns whose numbers to fetch.
--
-- ig_access_token is a live credential, which is why this table is readable
-- only by the service role. See the RLS block below.
create table if not exists public.content_accounts (
  user_id               uuid primary key references auth.users (id) on delete cascade,

  -- Instagram long-lived token. Expires 60 days after issue and is rotated in
  -- place by the cron, so it cannot live in an env var.
  ig_access_token       text,
  ig_token_refreshed_at timestamptz,

  -- Last failure message, so a silently broken sync is visible.
  last_sync_error       text,

  updated_at            timestamptz not null default now()
);

-- ─── ROW LEVEL SECURITY ─────────────────────────────────────────────
alter table public.content_viewers  enable row level security;
alter table public.content_metrics  enable row level security;
alter table public.content_accounts enable row level security;

-- Viewers: you can see the grants made TO you, and nothing else. This stops a
-- viewer enumerating who else has access.
drop policy if exists "own grants: select" on public.content_viewers;
create policy "own grants: select" on public.content_viewers
  for select using (auth.uid() = viewer_id);

-- Metrics: SELECT ONLY, and deliberately no insert/update/delete policies.
--
-- Only the cron writes this table, and it uses the service role, which
-- bypasses RLS. Omitting the write policies means no browser session -- owner
-- or viewer -- can fabricate or tamper with a metrics row. That is stricter
-- than the intake_entries template, and correct here because the write path
-- genuinely is not the browser.
drop policy if exists "content metrics: read own or granted" on public.content_metrics;
create policy "content metrics: read own or granted" on public.content_metrics
  for select using (
    auth.uid() = user_id
    or exists (
      select 1
      from public.content_viewers v
      where v.account_user_id = content_metrics.user_id
        and v.viewer_id = auth.uid()
    )
  );

-- Accounts: RLS enabled with ZERO policies, on purpose.
--
-- No policies means the anon and authenticated roles match no rows at all,
-- while the service role bypasses RLS and can still read. The Instagram token
-- is therefore unreachable from any browser by construction, rather than by
-- remembering not to select it.
--
-- Postgres RLS is row-level, not column-level, so there is no way to expose
-- ig_token_refreshed_at here without also exposing the token. The dashboard
-- gets its "last synced" value from max(synced_at) on content_metrics, which
-- the owner can read.
