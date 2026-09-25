-- AskGenie247: free daily limits and cost logging for the ask-genie-ai Edge Function.
-- Written only by the Edge Function (service role). The browser never reads or writes these.

-- One row per anonymous visitor per UTC day per kind ('reading' or 'chat').
-- visitor_hash is a salted SHA-256 of the caller's IP; the raw IP is never stored.
-- The special visitor '__global__' holds the all-visitors total used as a circuit breaker.
create table if not exists public.askgenie_daily_usage (
  visitor_hash text not null,
  day date not null,
  kind text not null check (kind in ('reading', 'chat')),
  used integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (visitor_hash, day, kind)
);

comment on table public.askgenie_daily_usage is
  'AskGenie247 free daily limits per hashed visitor. Written only by the ask-genie-ai Edge Function (service role).';

-- One row per AI request. No personal content, no IP, no visitor hash.
create table if not exists public.askgenie_request_log (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  type text not null,
  kind text not null,
  is_followup boolean not null default false,
  has_image boolean not null default false,
  model text,
  status text not null,
  latency_ms integer,
  input_tokens integer,
  output_tokens integer
);

comment on table public.askgenie_request_log is
  'AskGenie247 per-request cost/latency log (tokens only, no user content). Written only by the ask-genie-ai Edge Function.';

create index if not exists askgenie_request_log_created_at_idx
  on public.askgenie_request_log (created_at);

alter table public.askgenie_daily_usage enable row level security;
alter table public.askgenie_request_log enable row level security;
-- No policies: anon/authenticated get nothing. The service role bypasses RLS.

-- Claim one unit of today's allowance. Checks the visitor limit and the global
-- limit, and only increments when both allow it.
create or replace function public.askgenie_claim_usage(
  p_visitor text,
  p_kind text,
  p_limit integer,
  p_global_limit integer
)
returns table (allowed boolean, reason text, used integer, remaining integer)
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_day date := (now() at time zone 'utc')::date;
  v_used integer;
  v_global integer;
begin
  insert into public.askgenie_daily_usage (visitor_hash, day, kind)
       values (p_visitor, v_day, p_kind), ('__global__', v_day, p_kind)
  on conflict (visitor_hash, day, kind) do nothing;

  -- Lock both rows so parallel requests can't slip past the limits.
  select u.used into v_global from public.askgenie_daily_usage u
   where u.visitor_hash = '__global__' and u.day = v_day and u.kind = p_kind
   for update;

  select u.used into v_used from public.askgenie_daily_usage u
   where u.visitor_hash = p_visitor and u.day = v_day and u.kind = p_kind
   for update;

  if v_global >= p_global_limit then
    return query select false, 'global'::text, v_used, 0;
    return;
  end if;

  if v_used >= p_limit then
    return query select false, 'visitor'::text, v_used, 0;
    return;
  end if;

  update public.askgenie_daily_usage u
     set used = u.used + 1, updated_at = now()
   where u.day = v_day and u.kind = p_kind
     and u.visitor_hash in (p_visitor, '__global__');

  return query select true, ''::text, v_used + 1, greatest(0, p_limit - v_used - 1);
end $function$;

revoke all on function public.askgenie_claim_usage(text, text, integer, integer) from public, anon, authenticated;
grant execute on function public.askgenie_claim_usage(text, text, integer, integer) to service_role;
