-- Phase 6C: structured medical evidence extraction persistence boundary.
--
-- Extraction runs and per-item review decisions (Accept/Reject/Reset) are held
-- at runtime by the in-memory DocumentRepository. This migration adds the
-- durable boundary for that state so a later phase can flush runs to Supabase
-- without another schema change, and so SIH demos that restart the server can
-- persist review decisions.
--
-- The jsonb column is the persistence home for ExtractionRun[] keyed by
-- document id. The in-memory repository remains the runtime source of truth;
-- this is a forward-compatible boundary, not a second live database.

-- 1) Admits the documents step into the workflow_step constraint.
do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conrelid = 'public.patient_sessions'::regclass
      and contype = 'c'
      and conname like '%workflow_step%'
  ) then
    execute (
      select 'alter table public.patient_sessions drop constraint ' || quote_ident(conname)
      from pg_constraint
      where conrelid = 'public.patient_sessions'::regclass
        and contype = 'c'
        and conname like '%workflow_step%'
      limit 1
    );
  end if;
end $$;

alter table public.patient_sessions
  add constraint patient_sessions_workflow_step_check
    check (workflow_step in ('welcome', 'language', 'consent', 'start', 'complaint', 'anatomy', 'interview', 'documents'));

-- 2) Durable boundary for per-document extraction state:
--    { [documentId]: { run: ExtractionRun, reviewStatus: 'UNVERIFIED'|'PENDING_REVIEW'|'VERIFIED'|'REJECTED' } }
alter table public.patient_sessions
  add column if not exists document_extractions jsonb;

comment on column public.patient_sessions.document_extractions is
  'Phase 6C extraction runs and review decisions, keyed by document id. Runtime source of truth is the in-memory DocumentRepository; this column is the durable boundary for future persistence.';