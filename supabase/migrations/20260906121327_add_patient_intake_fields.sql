alter table public.patient_sessions
  add column if not exists complaint_text text,
  add column if not exists body_region text,
  add column if not exists body_subregion text,
  add column if not exists interview_data jsonb;

alter table public.patient_sessions
  add constraint patient_sessions_body_region_check
    check (body_region is null or body_region in ('head', 'chest', 'abdomen', 'back', 'arm', 'hand', 'leg', 'foot', 'skin', 'other'));

alter table public.patient_sessions
  add constraint patient_sessions_body_subregion_check
    check (body_subregion is null or body_subregion in ('front', 'back', 'left', 'right', 'upper', 'lower', 'middle', 'face', 'body'));

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
    check (workflow_step in ('welcome', 'language', 'consent', 'start', 'complaint', 'anatomy', 'interview'));
