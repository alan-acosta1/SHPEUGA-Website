-- Apply before deploying the new signup flow. Enable Supabase's Confirm email
-- setting and configure the signup email template as described in README.md.
-- Existing member profiles and executive roles are preserved.
begin;

create or replace function public.create_verified_member()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  profile jsonb;
begin
  if new.email_confirmed_at is null then
    return new;
  end if;
  if tg_op = 'UPDATE' then
    if old.email_confirmed_at is not null then
      return new;
    end if;
  end if;

  -- Keep existing profiles, including older signups that have no metadata.
  if exists (select 1 from public.members where user_id = new.id) then
    return new;
  end if;

  profile := jsonb_build_object(
    'user_id', new.id,
    'email', lower(new.email),
    'first_name', btrim(new.raw_user_meta_data ->> 'first_name'),
    'last_name', btrim(new.raw_user_meta_data ->> 'last_name'),
    'major', btrim(new.raw_user_meta_data ->> 'major'),
    'school_year', new.raw_user_meta_data ->> 'school_year',
    'school_id', new.raw_user_meta_data ->> 'school_id',
    -- User metadata is editable. Never trust it for authorization.
    'role', 'member'
  );

  if coalesce(profile ->> 'email', '') !~ '^[^[:space:]@]+@uga[.]edu$'
    or coalesce(profile ->> 'first_name', '') = ''
    or coalesce(profile ->> 'last_name', '') = ''
    or coalesce(profile ->> 'major', '') = ''
    or coalesce(profile ->> 'school_year', '') !~ '^[0-9]$'
    or coalesce(profile ->> 'school_id', '') !~ '^[0-9]{9}$' then
    raise exception 'A UGA email and complete member profile are required.'
      using errcode = '23514';
  end if;

  -- Populate using the deployed table's column types (year/ID may be numeric
  -- or text). Omit id so the table's default generates the member ID.
  insert into public.members (
    user_id, email, first_name, last_name, major, school_year, school_id, role
  )
  select user_id, email, first_name, last_name, major, school_year, school_id, role
  from jsonb_populate_record(null::public.members, profile);

  return new;
end;
$$;

revoke all on function public.create_verified_member() from public, anon, authenticated;

drop trigger if exists on_email_verified_create_member on auth.users;
create trigger on_email_verified_create_member
after insert or update of email_confirmed_at on auth.users
for each row execute function public.create_verified_member();

-- Consult the trusted Auth record rather than user-editable JWT metadata.
create or replace function public.has_verified_email()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from auth.users
    where id = (select auth.uid())
      and email_confirmed_at is not null
      and coalesce(is_anonymous, false) = false
  );
$$;

revoke all on function public.has_verified_email() from public;
grant execute on function public.has_verified_email() to anon, authenticated;

alter table public.members enable row level security;
drop policy if exists members_require_verified_email on public.members;
create policy members_require_verified_email
on public.members as restrictive for all to anon, authenticated
using ((select public.has_verified_email()))
with check ((select public.has_verified_email()));

-- Profiles now come from the trusted trigger. Restrictive policies combine
-- with existing policies instead of widening access granted by those policies.
drop policy if exists members_disallow_client_insert on public.members;
create policy members_disallow_client_insert
on public.members as restrictive for insert to anon, authenticated
with check (false);

commit;
