-- Run once in Supabase SQL Editor as the project database owner.
-- Uses the existing public.members(user_id, role, first_name, last_name, email).
-- All writes use authenticated RPCs; no browser receives event password hashes.
begin;
create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;
create schema if not exists points_private;
revoke all on schema points_private from public, anon, authenticated;

create table points_private.criteria (
  code text primary key,
  label text not null,
  points integer not null check (points > 0),
  is_event boolean not null
);
insert into points_private.criteria values
 ('first_gbm', 'First GBM', 5, true),
 ('regular_gbm', 'Regular GBM', 1, true),
 ('social_event', 'Social/Event', 1, true),
 ('professional_development', 'Professional Development Event', 2, true),
 ('instagram_repost', 'Instagram Flyer Repost', 1, false);

create table points_private.semesters (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (length(trim(name)) between 1 and 80),
  is_open boolean not null default true,
  created_at timestamptz not null default now()
);
insert into points_private.semesters(name) values ('Fall 2026');

create table points_private.events (
  id uuid primary key,
  semester_id uuid not null references points_private.semesters,
  title text not null check (length(trim(title)) between 1 and 120),
  description text not null default '' check (length(description) <= 1000),
  criterion text not null references points_private.criteria,
  password_hash text not null,
  opens_at timestamptz not null,
  closes_at timestamptz not null,
  is_open boolean not null default true,
  created_by uuid not null references auth.users,
  created_at timestamptz not null default now(),
  check (closes_at > opens_at)
);
create index points_events_semester on points_private.events(semester_id);

create table points_private.awards (
  id uuid primary key default gen_random_uuid(),
  request_id uuid unique,
  semester_id uuid not null references points_private.semesters,
  user_id uuid not null references auth.users,
  event_id uuid references points_private.events,
  criterion text not null references points_private.criteria,
  quantity integer not null default 1 check (quantity between 1 and 100),
  points integer not null check (points > 0),
  note text not null check (length(trim(note)) between 1 and 500),
  source text not null check (source in ('check_in', 'manual')),
  awarded_by uuid not null references auth.users,
  created_at timestamptz not null default now(),
  voided_at timestamptz,
  voided_by uuid references auth.users,
  void_reason text,
  unique (user_id, event_id)
);
create index points_awards_member_semester on points_private.awards(user_id, semester_id);
create index points_awards_semester on points_private.awards(semester_id);

create table points_private.attempts (
  user_id uuid primary key references auth.users,
  failures integer not null default 0,
  window_started timestamptz not null default now()
);
-- Private schema plus RLS defense in depth. Only database-owner RPCs access these.
alter table points_private.criteria enable row level security;
alter table points_private.semesters enable row level security;
alter table points_private.events enable row level security;
alter table points_private.awards enable row level security;
alter table points_private.attempts enable row level security;
revoke all on all tables in schema points_private from public, anon, authenticated;

create function points_private.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and exists (
    select 1 from public.members where user_id = auth.uid() and role = 'exec'
  );
$$;
create function points_private.require_member() returns uuid
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or not exists (select 1 from public.members where user_id = auth.uid()) then
    raise exception 'Sign in with a registered member account.' using errcode = '42501';
  end if;
  return auth.uid();
end;
$$;
create function points_private.require_admin() returns uuid
language plpgsql security definer set search_path = '' as $$
begin
  if not points_private.is_admin() then
    raise exception 'Only executive board admins can manage points.' using errcode = '42501';
  end if;
  return auth.uid();
end;
$$;

-- Keep members from promoting themselves through a direct members API request.
-- Database-owner maintenance (no auth.uid()) and existing exec admins still work.
create function points_private.guard_member_role() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if (auth.uid() is not null or current_setting('role', true) in ('anon', 'authenticated'))
    and not points_private.is_admin() then
    if TG_OP = 'INSERT' then
      if new.role is distinct from 'member' or new.user_id is distinct from auth.uid() then
        raise exception 'Members can only create their own member profile.' using errcode = '42501';
      end if;
    elsif new.role is distinct from old.role or new.user_id is distinct from old.user_id then
      raise exception 'Only admins can change member roles or account links.' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;
create trigger points_guard_member_role before insert or update on public.members
for each row execute function points_private.guard_member_role();

create function public.points_create_semester(p_name text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare result uuid;
begin
  perform points_private.require_admin();
  if p_name is null or length(trim(p_name)) not between 1 and 80 then raise exception 'Enter a semester name (up to 80 characters).'; end if;
  insert into points_private.semesters(name) values (trim(p_name))
  on conflict(name) do update set name = excluded.name returning id into result;
  return result;
end;
$$;
create function public.points_set_semester_open(p_semester_id uuid, p_open boolean) returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform points_private.require_admin();
  if p_open is null then raise exception 'Choose open or closed.'; end if;
  update points_private.semesters set is_open = p_open where id = p_semester_id;
  if not found then raise exception 'Semester not found.'; end if;
end;
$$;

create function public.points_create_event(
  p_id uuid, p_semester_id uuid, p_title text, p_description text,
  p_criterion text, p_password text, p_opens_at timestamptz, p_closes_at timestamptz
) returns uuid
language plpgsql security definer set search_path = '' as $$
declare actor uuid; existing points_private.events; hash text; crypto_schema text;
begin
  actor := points_private.require_admin();
  select * into existing from points_private.events where id = p_id;
  if found then
    if existing.created_by = actor then return existing.id; end if;
    raise exception 'Event ID already exists.';
  end if;
  if not exists (select 1 from points_private.semesters where id = p_semester_id and is_open) then raise exception 'Choose an open semester.'; end if;
  if p_title is null or length(trim(p_title)) not between 1 and 120 then raise exception 'Enter an event title (up to 120 characters).'; end if;
  if length(coalesce(p_description, '')) > 1000 then raise exception 'Description must be 1,000 characters or fewer.'; end if;
  if not exists (select 1 from points_private.criteria where code = p_criterion and is_event) then raise exception 'Choose an event attendance criterion.'; end if;
  if p_password is null or octet_length(p_password) not between 6 and 72 then raise exception 'Use a password between 6 and 72 bytes.'; end if;
  if p_opens_at is null or p_closes_at is null or p_closes_at <= p_opens_at then raise exception 'Closing time must be after opening time.'; end if;
  -- Existing Supabase projects may have pgcrypto in public or extensions.
  select n.nspname into crypto_schema from pg_catalog.pg_extension e join pg_catalog.pg_namespace n on n.oid=e.extnamespace where e.extname='pgcrypto';
  execute format('select %I.crypt($1, %I.gen_salt(''bf'', 10))', crypto_schema, crypto_schema) into hash using p_password;
  insert into points_private.events(id,semester_id,title,description,criterion,password_hash,opens_at,closes_at,created_by)
  values(p_id,p_semester_id,trim(p_title),coalesce(p_description,''),p_criterion,hash,p_opens_at,p_closes_at,actor);
  return p_id;
end;
$$;
create function public.points_set_event_open(p_event_id uuid, p_open boolean) returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform points_private.require_admin();
  if p_open is null then raise exception 'Choose open or closed.'; end if;
  update points_private.events set is_open = p_open where id = p_event_id;
  if not found then raise exception 'Event not found.'; end if;
end;
$$;

create function public.points_check_in(p_event_id uuid, p_password text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare actor uuid; event points_private.events; attempt points_private.attempts; hash text; crypto_schema text; value integer;
begin
  actor := points_private.require_member();
  -- Serialize attempts by member, including requests against different events.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(actor::text, 0));
  select * into event from points_private.events where id = p_event_id for share;
  if not found then return jsonb_build_object('ok',false,'message','Event not found.'); end if;
  if exists (select 1 from points_private.awards where user_id=actor and event_id=p_event_id) then
    return jsonb_build_object('ok',false,'message','Attendance has already been recorded. Contact an admin for corrections.');
  end if;
  if not event.is_open or now() < event.opens_at or now() >= event.closes_at
    or not exists (select 1 from points_private.semesters where id=event.semester_id and is_open) then
    return jsonb_build_object('ok',false,'message','Check-in is closed for this event.');
  end if;
  insert into points_private.attempts(user_id) values(actor) on conflict do nothing;
  select * into attempt from points_private.attempts where user_id=actor for update;
  if attempt.window_started <= now() - interval '15 minutes' then
    update points_private.attempts set failures=0,window_started=now() where user_id=actor;
    attempt.failures := 0;
  end if;
  if attempt.failures >= 5 then return jsonb_build_object('ok',false,'message','Too many incorrect attempts. Try again in 15 minutes.'); end if;
  if p_password is not null and octet_length(p_password) between 6 and 72 then
    select n.nspname into crypto_schema from pg_catalog.pg_extension e join pg_catalog.pg_namespace n on n.oid=e.extnamespace where e.extname='pgcrypto';
    execute format('select %I.crypt($1, $2)',crypto_schema) into hash using p_password,event.password_hash;
  end if;
  if hash is null or hash <> event.password_hash then
    update points_private.attempts set failures=failures+1 where user_id=actor;
    -- Return instead of raising so failed-attempt counters commit.
    return jsonb_build_object('ok',false,'message','Incorrect event password.');
  end if;
  select points into value from points_private.criteria where code=event.criterion;
  insert into points_private.awards(semester_id,user_id,event_id,criterion,points,note,source,awarded_by)
  values(event.semester_id,actor,event.id,event.criterion,value,event.title,'check_in',actor)
  on conflict(user_id,event_id) do nothing;
  if not found then return jsonb_build_object('ok',false,'message','Attendance has already been recorded.'); end if;
  return jsonb_build_object('ok',true,'message',format('Checked in! You earned %s points.',value),'points',value);
end;
$$;

create function public.points_award_manual(
 p_request_id uuid, p_semester_id uuid, p_user_id uuid, p_criterion text,
 p_quantity integer, p_note text, p_event_id uuid default null
) returns uuid
language plpgsql security definer set search_path = '' as $$
declare actor uuid; result uuid; value integer; event points_private.events; prior points_private.awards;
begin
 actor := points_private.require_admin();
 select * into prior from points_private.awards where request_id=p_request_id;
 if found then
   if prior.awarded_by=actor and prior.user_id=p_user_id and prior.semester_id=p_semester_id
     and prior.criterion=p_criterion and prior.quantity=p_quantity and prior.note=trim(p_note)
     and prior.event_id is not distinct from p_event_id then return prior.id; end if;
   raise exception 'This submission ID has already been used. Refresh and try again.';
 end if;
 if p_request_id is null then raise exception 'Submission ID is required.'; end if;
 if not exists(select 1 from points_private.semesters where id=p_semester_id and is_open) then raise exception 'Choose an open semester.'; end if;
 if not exists(select 1 from public.members where user_id=p_user_id) then raise exception 'Member not found.'; end if;
 if p_quantity is null or p_quantity not between 1 and 100 then raise exception 'Quantity must be from 1 to 100.'; end if;
 if p_note is null or length(trim(p_note)) not between 1 and 500 then raise exception 'Add a reason (up to 500 characters).'; end if;
 select points into value from points_private.criteria where code=p_criterion;
 if not found then raise exception 'Choose a valid criterion.'; end if;
 if p_event_id is not null then
   select * into event from points_private.events where id=p_event_id for share;
   if not found or event.semester_id<>p_semester_id or event.criterion<>p_criterion or p_quantity<>1 then
     raise exception 'Event attendance must match the semester and criterion, with quantity 1.';
   end if;
 end if;
 insert into points_private.awards(request_id,semester_id,user_id,event_id,criterion,quantity,points,note,source,awarded_by)
 values(p_request_id,p_semester_id,p_user_id,p_event_id,p_criterion,p_quantity,value*p_quantity,trim(p_note),'manual',actor)
 returning id into result;
 return result;
 exception when unique_violation then raise exception 'This member already has attendance recorded for that event, or this award was already submitted.';
end;
$$;
create function public.points_void_award(p_award_id uuid, p_reason text) returns void
language plpgsql security definer set search_path = '' as $$
declare actor uuid;
begin
 actor := points_private.require_admin();
 if p_reason is null or length(trim(p_reason)) not between 1 and 500 then raise exception 'Add a correction reason (up to 500 characters).'; end if;
 update points_private.awards set voided_at=now(),voided_by=actor,void_reason=trim(p_reason) where id=p_award_id and voided_at is null;
 if not found then raise exception 'Award not found or already voided.'; end if;
end;
$$;

create function public.points_dashboard(p_semester_id uuid default null) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare actor uuid; admin boolean; semester uuid; result jsonb; totals jsonb;
begin
 actor := points_private.require_member();
 admin := points_private.is_admin();
 semester := p_semester_id;
 if semester is null then select id into semester from points_private.semesters order by created_at desc,id limit 1; end if;
 if not exists(select 1 from points_private.semesters where id=semester) then raise exception 'Semester not found.'; end if;
 with people as (
   select distinct on (user_id) user_id, first_name,last_name,email from public.members where user_id is not null order by user_id
 ), scores as (
   select p.*, coalesce(sum(a.points),0)::integer total,
     coalesce(sum(case when c.is_event then a.quantity else 0 end),0)::integer event_count
   from people p left join points_private.awards a on a.user_id=p.user_id and a.semester_id=semester and a.voided_at is null
   left join points_private.criteria c on c.code=a.criterion group by p.user_id,p.first_name,p.last_name,p.email
 ), ranked as (select *,rank() over(order by total desc)::integer rank from scores)
 select coalesce(jsonb_agg(to_jsonb(r) order by r.rank,r.last_name,r.first_name),'[]') into totals from ranked r;
 result := jsonb_build_object(
   'is_admin',admin,'user_id',actor,'semester_id',semester,
   'semesters',(select coalesce(jsonb_agg(to_jsonb(s) order by s.created_at desc),'[]') from points_private.semesters s),
   'criteria',(select jsonb_agg(to_jsonb(c) order by c.points desc,c.label) from points_private.criteria c),
   'summary',(select value - 'email' - 'first_name' - 'last_name' from jsonb_array_elements(totals) where value->>'user_id'=actor::text),
   'events',(select coalesce(jsonb_agg(jsonb_build_object(
      'id',e.id,'title',e.title,'description',e.description,'criterion',e.criterion,'points',c.points,
      'opens_at',e.opens_at,'closes_at',e.closes_at,'is_open',e.is_open,
      'claimed',exists(select 1 from points_private.awards a where a.event_id=e.id and a.user_id=actor)
    ) order by e.opens_at desc),'[]') from points_private.events e join points_private.criteria c on c.code=e.criterion where e.semester_id=semester),
   'awards',(select coalesce(jsonb_agg(to_jsonb(a) order by a.created_at desc),'[]') from (
      select a.id,a.user_id,a.criterion,a.quantity,a.points,a.note,a.source,a.created_at,a.voided_at,a.void_reason,
        a.event_id,e.title event_title
      from points_private.awards a left join points_private.events e on e.id=a.event_id
      where a.semester_id=semester and a.user_id=actor order by a.created_at desc limit 200
   ) a)
 );
 if admin then
   result := result || jsonb_build_object('members',totals,'recent_awards',(
     select coalesce(jsonb_agg(to_jsonb(a) order by a.created_at desc),'[]') from (
       select a.id,a.user_id,a.criterion,a.quantity,a.points,a.note,a.source,a.created_at,a.voided_at,a.void_reason,
         a.event_id,e.title event_title,
         (select concat_ws(' ',m.first_name,m.last_name) from public.members m where m.user_id=a.user_id limit 1) member_name,
         (select concat_ws(' ',m.first_name,m.last_name) from public.members m where m.user_id=a.awarded_by limit 1) awarded_by_name
       from points_private.awards a left join points_private.events e on e.id=a.event_id where a.semester_id=semester
       order by a.created_at desc limit 500
     ) a
   ));
 end if;
 return result;
end;
$$;

-- PostgreSQL functions default to PUBLIC execute: remove it explicitly.
revoke all on all functions in schema points_private from public, anon, authenticated;
revoke all on function public.points_create_semester(text), public.points_set_semester_open(uuid,boolean),
 public.points_create_event(uuid,uuid,text,text,text,text,timestamptz,timestamptz),
 public.points_set_event_open(uuid,boolean), public.points_check_in(uuid,text),
 public.points_award_manual(uuid,uuid,uuid,text,integer,text,uuid), public.points_void_award(uuid,text),
 public.points_dashboard(uuid) from public, anon;
grant execute on function public.points_create_semester(text), public.points_set_semester_open(uuid,boolean),
 public.points_create_event(uuid,uuid,text,text,text,text,timestamptz,timestamptz),
 public.points_set_event_open(uuid,boolean), public.points_check_in(uuid,text),
 public.points_award_manual(uuid,uuid,uuid,text,integer,text,uuid), public.points_void_award(uuid,text),
 public.points_dashboard(uuid) to authenticated;
notify pgrst, 'reload schema';
commit;
