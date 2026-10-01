-- Run once in the Supabase SQL Editor as the project database owner.
-- Lets executive board admins permanently delete a member: the public.members
-- row, the member's points history (if the points system is installed), and
-- their login account in auth.users so the email can sign up again later.
-- Exec accounts cannot be deleted here; demote them to "member" first.
begin;

create or replace function public.admin_delete_member(target_member_id text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_user_id uuid;
  target_role text;
begin
  if auth.uid() is null or not exists (
    select 1 from public.members where user_id = auth.uid() and role = 'exec'
  ) then
    raise exception 'Only executive board admins can delete members.' using errcode = '42501';
  end if;

  select user_id, role into target_user_id, target_role
  from public.members
  where id::text = target_member_id;

  if not found then
    raise exception 'Member not found.' using errcode = 'P0002';
  end if;
  if target_user_id = auth.uid() then
    raise exception 'You cannot delete your own account.' using errcode = '42501';
  end if;
  if target_role = 'exec' then
    raise exception 'Change this person''s role to Member before deleting them.' using errcode = '42501';
  end if;

  delete from public.members where id::text = target_member_id;

  if target_user_id is not null then
    if to_regclass('points_private.awards') is not null then
      execute 'delete from points_private.awards where user_id = $1' using target_user_id;
    end if;
    if to_regclass('points_private.attempts') is not null then
      execute 'delete from points_private.attempts where user_id = $1' using target_user_id;
    end if;
    delete from auth.users where id = target_user_id;
  end if;
end;
$$;

revoke all on function public.admin_delete_member(text) from public, anon;
grant execute on function public.admin_delete_member(text) to authenticated;

commit;
