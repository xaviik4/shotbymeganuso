-- Internal operations CRM. Anonymous users receive no table policies; private
-- rows require authenticated workspace membership, including through Vercel APIs.

create table if not exists public.ops_workspaces (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.ops_memberships (
  workspace_id uuid not null references public.ops_workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'member', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table if not exists public.ops_prospects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.ops_workspaces(id) on delete cascade,
  name text not null,
  brokerage text not null default '',
  area text not null default 'Other Omaha' check (area in ('South Omaha', 'Papillion', 'Bellevue', 'Gretna', 'Elkhorn', 'NW Omaha', 'West Omaha', 'Other Omaha')),
  speaks_spanish boolean not null default false,
  sales_last_12_months integer not null default 0 check (sales_last_12_months >= 0),
  new_construction boolean not null default false,
  setup text not null default 'Solo' check (setup in ('Solo', 'Team lead', 'Team member', 'Brokerage owner')),
  instagram text not null default '',
  email text not null default '',
  phone text not null default '',
  source text not null default 'Other' check (source in ('Zillow', 'Instagram', 'Realtor.com', 'Referral', 'Facebook group', 'Other')),
  channel text not null default 'Instagram DM' check (channel in ('Instagram DM', 'Email', 'Phone', 'Facebook')),
  message_type text not null default 'Research' check (message_type in ('Research', 'Sales')),
  message_version text check (message_version is null or message_version in ('v1', 'v2', 'v3', 'v4', 'v5')),
  first_sent_date date,
  follow_ups_sent integer not null default 0 check (follow_ups_sent >= 0),
  last_contact_date date,
  call_at timestamptz,
  status text not null default 'to contact' check (status in ('to contact', 'sent', 'replied', 'interested', 'booked', 'showed', 'closed', 'no', 'do not contact')),
  next_step text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ops_clients (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.ops_workspaces(id) on delete cascade,
  prospect_id uuid references public.ops_prospects(id) on delete set null,
  business_name text not null,
  contact text not null default '',
  start_date date,
  monthly_price numeric(12, 2) not null default 0 check (monthly_price >= 0),
  filming_date date,
  status text not null default 'onboarding' check (status in ('onboarding', 'filming', 'editing', 'awaiting approval', 'live', 'reporting', 'paused', 'churned')),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, prospect_id)
);

create table if not exists public.ops_prospect_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.ops_workspaces(id) on delete cascade,
  prospect_id uuid not null references public.ops_prospects(id) on delete cascade,
  event_type text not null check (event_type in ('message_sent', 'reply_received', 'prospect_interested', 'call_booked', 'call_held', 'client_signed')),
  happened_at timestamptz not null,
  details jsonb not null default '{}'::jsonb,
  recorded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.ops_intake_rate_limits (
  ip_hash text not null,
  window_start timestamptz not null,
  submission_count integer not null default 0 check (submission_count >= 0),
  primary key (ip_hash, window_start)
);

create index if not exists ops_prospects_workspace_status_idx on public.ops_prospects(workspace_id, status);
create index if not exists ops_prospects_workspace_created_idx on public.ops_prospects(workspace_id, created_at desc);
create index if not exists ops_prospects_followup_idx on public.ops_prospects(workspace_id, first_sent_date, last_contact_date);
create index if not exists ops_clients_workspace_status_idx on public.ops_clients(workspace_id, status);
create index if not exists ops_events_workspace_happened_idx on public.ops_prospect_events(workspace_id, happened_at);
create index if not exists ops_events_prospect_idx on public.ops_prospect_events(prospect_id, happened_at);

-- Default workspace exists after migration; an owner membership is granted
-- separately by the operator using the SQL snippet in the project handoff.
insert into public.ops_workspaces (id, slug, name)
values ('52f3df09-e12e-4f98-9cf0-86d0ff06ad73', 'meganusopr', 'meganusopr Operations')
on conflict (slug) do nothing;

alter table public.ops_workspaces enable row level security;
alter table public.ops_memberships enable row level security;
alter table public.ops_prospects enable row level security;
alter table public.ops_clients enable row level security;
alter table public.ops_prospect_events enable row level security;
alter table public.ops_intake_rate_limits enable row level security;

revoke all on public.ops_workspaces, public.ops_memberships, public.ops_prospects,
  public.ops_clients, public.ops_prospect_events, public.ops_intake_rate_limits
  from anon, authenticated;
grant all on public.ops_workspaces, public.ops_memberships, public.ops_prospects,
  public.ops_clients, public.ops_prospect_events, public.ops_intake_rate_limits
  to service_role;

-- The server checks membership before each private request. The caller's JWT is
-- then used for database work so these authenticated policies remain a second
-- boundary. Membership rows themselves stay server-only.
create or replace function public.is_ops_workspace_member(p_workspace_id uuid, p_write boolean default false)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, auth
as $$
  select exists (
    select 1 from public.ops_memberships m
    where m.workspace_id = p_workspace_id
      and m.user_id = auth.uid()
      and (not p_write or m.role in ('owner', 'admin', 'member'))
  );
$$;
revoke all on function public.is_ops_workspace_member(uuid, boolean) from public, anon;
grant execute on function public.is_ops_workspace_member(uuid, boolean) to authenticated, service_role;

-- Public intake is a write-only operation; this function writes both rows and
-- returns no prospect data to the calling serverless function.
create or replace function public.create_ops_intake_submission(
  p_workspace_id uuid,
  p_name text,
  p_email text,
  p_phone text,
  p_brokerage text,
  p_instagram text,
  p_notes text,
  p_last_contact_date date
) returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  new_prospect_id uuid;
begin
  insert into public.ops_prospects (
    workspace_id, name, email, phone, brokerage, instagram,
    source, status, notes, last_contact_date
  ) values (
    p_workspace_id, p_name, p_email, p_phone, p_brokerage, p_instagram,
    'Other', 'interested', p_notes, p_last_contact_date
  ) returning id into new_prospect_id;

  insert into public.ops_prospect_events (
    workspace_id, prospect_id, event_type, happened_at, details
  ) values (
    p_workspace_id, new_prospect_id, 'prospect_interested', now(), '{"source":"public-intake"}'::jsonb
  );
end;
$$;
revoke all on function public.create_ops_intake_submission(uuid, text, text, text, text, text, text, date) from public, anon, authenticated;
grant execute on function public.create_ops_intake_submission(uuid, text, text, text, text, text, text, date) to service_role;

grant select, insert, update, delete on public.ops_prospects, public.ops_clients,
  public.ops_prospect_events to authenticated;
revoke update, delete on public.ops_prospect_events from authenticated;
grant select, insert on public.ops_prospect_events to authenticated;

drop policy if exists "ops members read prospects" on public.ops_prospects;
create policy "ops members read prospects" on public.ops_prospects
  for select to authenticated using (public.is_ops_workspace_member(workspace_id, false));
drop policy if exists "ops writers create prospects" on public.ops_prospects;
create policy "ops writers create prospects" on public.ops_prospects
  for insert to authenticated with check (public.is_ops_workspace_member(workspace_id, true));
drop policy if exists "ops writers update prospects" on public.ops_prospects;
create policy "ops writers update prospects" on public.ops_prospects
  for update to authenticated using (public.is_ops_workspace_member(workspace_id, true))
  with check (public.is_ops_workspace_member(workspace_id, true));
drop policy if exists "ops writers delete prospects" on public.ops_prospects;
create policy "ops writers delete prospects" on public.ops_prospects
  for delete to authenticated using (public.is_ops_workspace_member(workspace_id, true));

drop policy if exists "ops members read clients" on public.ops_clients;
create policy "ops members read clients" on public.ops_clients
  for select to authenticated using (public.is_ops_workspace_member(workspace_id, false));
drop policy if exists "ops writers create clients" on public.ops_clients;
create policy "ops writers create clients" on public.ops_clients
  for insert to authenticated with check (
    public.is_ops_workspace_member(workspace_id, true)
    and (prospect_id is null or exists (
      select 1 from public.ops_prospects p
      where p.id = ops_clients.prospect_id and p.workspace_id = ops_clients.workspace_id
    ))
  );
drop policy if exists "ops writers update clients" on public.ops_clients;
create policy "ops writers update clients" on public.ops_clients
  for update to authenticated using (public.is_ops_workspace_member(workspace_id, true))
  with check (
    public.is_ops_workspace_member(workspace_id, true)
    and (prospect_id is null or exists (
      select 1 from public.ops_prospects p
      where p.id = ops_clients.prospect_id and p.workspace_id = ops_clients.workspace_id
    ))
  );
drop policy if exists "ops writers delete clients" on public.ops_clients;
create policy "ops writers delete clients" on public.ops_clients
  for delete to authenticated using (public.is_ops_workspace_member(workspace_id, true));

drop policy if exists "ops members read prospect events" on public.ops_prospect_events;
create policy "ops members read prospect events" on public.ops_prospect_events
  for select to authenticated using (
    public.is_ops_workspace_member(workspace_id, false)
    and exists (select 1 from public.ops_prospects p
      where p.id = ops_prospect_events.prospect_id and p.workspace_id = ops_prospect_events.workspace_id)
  );
drop policy if exists "ops writers create prospect events" on public.ops_prospect_events;
create policy "ops writers create prospect events" on public.ops_prospect_events
  for insert to authenticated with check (
    public.is_ops_workspace_member(workspace_id, true)
    and exists (select 1 from public.ops_prospects p
      where p.id = ops_prospect_events.prospect_id and p.workspace_id = ops_prospect_events.workspace_id)
  );
-- Atomic fixed-window limiter, callable only by the server's service role.
create or replace function public.consume_ops_intake_rate_limit(
  p_ip_hash text,
  p_window_start timestamptz,
  p_limit integer default 5
) returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  was_allowed boolean;
begin
  delete from public.ops_intake_rate_limits
  where window_start < date_trunc('hour', now()) - interval '48 hours';

  insert into public.ops_intake_rate_limits (ip_hash, window_start, submission_count)
  values (p_ip_hash, p_window_start, 1)
  on conflict (ip_hash, window_start) do update
    set submission_count = public.ops_intake_rate_limits.submission_count + 1
    where public.ops_intake_rate_limits.submission_count < p_limit
  returning true into was_allowed;

  return coalesce(was_allowed, false);
end;
$$;

revoke all on function public.consume_ops_intake_rate_limit(text, timestamptz, integer) from public, anon, authenticated;
grant execute on function public.consume_ops_intake_rate_limit(text, timestamptz, integer) to service_role;
