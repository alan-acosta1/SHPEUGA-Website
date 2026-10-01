-- Apply after 202609260001_points_event_deletion.sql, before deploying the UI.
-- Execs retain management access and historical awards, but cannot earn new points
-- and are excluded from totals, rankings, and the manual award recipient list.
-- Existing awards are preserved if an exec later returns to the member role.
begin;

create or replace function public.points_check_in(p_event_id uuid, p_password text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare actor uuid; event points_private.events; attempt points_private.attempts; hash text; crypto_schema text; value integer;
begin
  actor := points_private.require_member();
  -- Hold the recipient's role stable until the award transaction finishes.
  perform 1 from public.members where user_id = actor for share;
  if points_private.is_admin() then
    return jsonb_build_object('ok',false,'message','Executive board members are not eligible to receive points.');
  end if;
  -- Serialize attempts by member, including requests against different events.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(actor::text, 0));
  select * into event from points_private.events where id = p_event_id and deleted_at is null for share;
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

create or replace function public.points_award_manual(
 p_request_id uuid, p_semester_id uuid, p_user_id uuid, p_criterion text,
 p_quantity integer, p_note text, p_event_id uuid default null
) returns uuid
language plpgsql security definer set search_path = '' as $$
declare actor uuid; result uuid; value integer; event points_private.events; prior points_private.awards;
begin
 actor := points_private.require_admin();
 -- A stale browser or direct RPC call must not award points to an exec.
 perform 1 from public.members where user_id = p_user_id for share;
 if not found then raise exception 'Member not found.'; end if;
 if exists(select 1 from public.members where user_id = p_user_id and role = 'exec') then
   raise exception 'Executive board members are not eligible to receive points.' using errcode = '42501';
 end if;
 select * into prior from points_private.awards where request_id=p_request_id;
 if found then
   if prior.awarded_by=actor and prior.user_id=p_user_id and prior.semester_id=p_semester_id
     and prior.criterion=p_criterion and prior.quantity=p_quantity and prior.note=trim(p_note)
     and prior.event_id is not distinct from p_event_id then return prior.id; end if;
   raise exception 'This submission ID has already been used. Refresh and try again.';
 end if;
 if p_request_id is null then raise exception 'Submission ID is required.'; end if;
 if not exists(select 1 from points_private.semesters where id=p_semester_id and is_open) then raise exception 'Choose an open semester.'; end if;
 if p_quantity is null or p_quantity not between 1 and 100 then raise exception 'Quantity must be from 1 to 100.'; end if;
 if p_note is null or length(trim(p_note)) not between 1 and 500 then raise exception 'Add a reason (up to 500 characters).'; end if;
 select points into value from points_private.criteria where code=p_criterion;
 if not found then raise exception 'Choose a valid criterion.'; end if;
 if p_event_id is not null then
   select * into event from points_private.events where id=p_event_id and deleted_at is null for share;
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

create or replace function public.points_dashboard(p_semester_id uuid default null) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare actor uuid; admin boolean; semester uuid; result jsonb; totals jsonb;
begin
 actor := points_private.require_member();
 admin := points_private.is_admin();
 semester := p_semester_id;
 if semester is null then select id into semester from points_private.semesters order by created_at desc,id limit 1; end if;
 if not exists(select 1 from points_private.semesters where id=semester) then raise exception 'Semester not found.'; end if;
 with people as (
   select distinct on (m.user_id) m.user_id, m.first_name,m.last_name,m.email
   from public.members m
   where m.user_id is not null
     and not exists(select 1 from public.members exec where exec.user_id=m.user_id and exec.role='exec')
   order by m.user_id
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
    ) order by e.opens_at desc),'[]') from points_private.events e join points_private.criteria c on c.code=e.criterion where e.semester_id=semester and e.deleted_at is null),
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

notify pgrst, 'reload schema';
commit;
