-- =====================================================================
-- Iron Bear — waitlist site schema
-- Paste this whole file into the Supabase SQL editor and run.
-- Idempotent: safe to re-run.
-- =====================================================================

-- ----- waitlist ------------------------------------------------------
create table if not exists public.waitlist (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  email             text not null unique,
  first_name        text,
  role              text not null check (role in ('coach','individual')),
  hype_answer       text,
  session_id        text,
  device            text,
  referrer          text,
  utm_source        text,
  utm_medium        text,
  utm_campaign      text,
  utm_term          text,
  utm_content       text,
  time_to_submit_ms integer
);

create index if not exists waitlist_role_idx       on public.waitlist (role);
create index if not exists waitlist_created_at_idx on public.waitlist (created_at desc);

alter table public.waitlist enable row level security;

drop policy if exists "anon insert waitlist" on public.waitlist;
create policy "anon insert waitlist"
  on public.waitlist for insert
  to anon
  with check (true);

-- Allow anon to read ONLY counts via the v_counts view below — never raw rows.
-- (No select policy is created on the table; default-deny is what we want.)

-- ----- events --------------------------------------------------------
create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  session_id  text not null,
  event_name  text not null,
  properties  jsonb not null default '{}'::jsonb,
  path        text,
  referrer    text,
  utm         jsonb,
  device      text,
  viewport_w  integer,
  viewport_h  integer
);

create index if not exists events_session_idx    on public.events (session_id);
create index if not exists events_name_idx       on public.events (event_name);
create index if not exists events_created_at_idx on public.events (created_at desc);

alter table public.events enable row level security;

drop policy if exists "anon insert events" on public.events;
create policy "anon insert events"
  on public.events for insert
  to anon
  with check (true);

-- ----- public count view --------------------------------------------
-- Exposed to anon so the hero LiveCount can show "<n> coaches · <m> lifters".
-- Uses security_invoker=false (default for views) so it bypasses the
-- table RLS — but only exposes aggregated counts, no PII.
create or replace view public.v_waitlist_counts as
  select role, count(*)::bigint as count
  from public.waitlist
  group by role;

grant select on public.v_waitlist_counts to anon;

-- ----- analytics views (for the team) -------------------------------
create or replace view public.v_funnel as
select
  count(distinct session_id) filter (where event_name = 'visit')           as visitors,
  count(distinct session_id) filter (where event_name = 'cta_click')       as cta_clickers,
  count(distinct session_id) filter (where event_name = 'form_started')    as form_starters,
  count(distinct session_id) filter (where event_name = 'form_submitted')  as form_submitters,
  count(distinct session_id) filter (where event_name = 'form_abandoned')  as form_abandoners
from public.events;

create or replace view public.v_conversion as
select
  visitors,
  form_submitters as submitted,
  case when visitors > 0 then form_submitters::numeric / visitors else 0 end as conversion_rate,
  case when form_starters > 0 then form_submitters::numeric / form_starters else 0 end as completion_rate,
  case when visitors > 0 then cta_clickers::numeric / visitors else 0 end as ctr,
  case when form_starters > 0 then 1 - (form_submitters::numeric / form_starters) else 0 end as drop_off_rate
from public.v_funnel;

create or replace view public.v_drop_off as
select properties->>'last_step' as last_step, count(*) as count
from public.events
where event_name = 'form_abandoned'
group by 1
order by 2 desc;

create or replace view public.v_repeated_cta as
select properties->>'cta_id' as cta_id, count(*) as repeated_clicks
from public.events
where event_name = 'repeated_cta'
group by 1
order by 2 desc;

create or replace view public.v_device_split as
select device, count(distinct session_id) as sessions
from public.events
where event_name = 'visit'
group by 1
order by 2 desc;

create or replace view public.v_scroll_depth as
select (properties->>'depth')::int as depth, count(distinct session_id) as sessions
from public.events
where event_name = 'scroll_depth'
group by 1
order by 1;

create or replace view public.v_utm_quality as
select
  properties->'utm'->>'utm_source' as utm_source,
  count(distinct session_id) filter (where event_name = 'visit')          as visitors,
  count(distinct session_id) filter (where event_name = 'form_submitted') as conversions
from public.events
group by 1
order by visitors desc nulls last;

-- These analytics views are NOT granted to anon. Read them in the
-- Supabase SQL editor or via the service_role key.
