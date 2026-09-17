create table if not exists public.patient_sessions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'EXPIRED', 'COMPLETED')),
  language text not null default 'en' check (language in ('en', 'hi', 'bn', 'te', 'ta', 'mr')),
  consent_status text not null default 'NOT_REVIEWED' check (consent_status in ('NOT_REVIEWED', 'ACCEPTED', 'DECLINED')),
  consent_version text,
  consent_timestamp timestamptz,
  workflow_step text not null default 'welcome' check (workflow_step in ('welcome', 'language', 'consent', 'start')),
  idempotency_key text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  expires_at timestamptz not null default timezone('utc', now()) + interval '30 minutes',
  completed_at timestamptz,
  constraint patient_sessions_consent_consistency check (
    (consent_status = 'NOT_REVIEWED' and consent_version is null and consent_timestamp is null)
    or (consent_status in ('ACCEPTED', 'DECLINED') and consent_version is not null and consent_timestamp is not null)
  ),
  constraint patient_sessions_completed_consistency check (
    (status = 'COMPLETED' and completed_at is not null) or (status <> 'COMPLETED' and completed_at is null)
  ),
  constraint patient_sessions_expiry_after_creation check (expires_at > created_at)
);

create unique index if not exists patient_sessions_owner_idempotency_idx
  on public.patient_sessions (owner_id, idempotency_key);

create index if not exists patient_sessions_owner_status_idx
  on public.patient_sessions (owner_id, status, expires_at);

create or replace function public.set_patient_sessions_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

 drop trigger if exists patient_sessions_updated_at on public.patient_sessions;
create trigger patient_sessions_updated_at
before update on public.patient_sessions
for each row execute function public.set_patient_sessions_updated_at();

alter table public.patient_sessions enable row level security;
alter table public.patient_sessions force row level security;

drop policy if exists "patient sessions owners can select" on public.patient_sessions;
create policy "patient sessions owners can select"
on public.patient_sessions for select
to authenticated
using (owner_id = (select auth.uid()));

drop policy if exists "patient sessions owners can insert" on public.patient_sessions;
create policy "patient sessions owners can insert"
on public.patient_sessions for insert
to authenticated
with check (owner_id = (select auth.uid()));

drop policy if exists "patient sessions owners can update" on public.patient_sessions;
create policy "patient sessions owners can update"
on public.patient_sessions for update
to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

revoke all on public.patient_sessions from anon;
grant select, insert, update on public.patient_sessions to authenticated;
