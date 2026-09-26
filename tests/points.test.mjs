import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto';

const ADMIN = '00000000-0000-4000-8000-000000000001';
const MEMBER = '00000000-0000-4000-8000-000000000002';
const OTHER = '00000000-0000-4000-8000-000000000003';
const OUTSIDER = '00000000-0000-4000-8000-000000000004';
const password = 'chapter-check-in-2026';

test('Supabase points migration, permissions, and accounting', async t => {
    const db = new PGlite({ extensions: { pgcrypto } });
    try {
        await db.exec(`
            create role anon nologin;
            create role authenticated nologin;
            create schema auth;
            create table auth.users(id uuid primary key);
            create function auth.uid() returns uuid language sql stable as
            $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
            grant usage on schema auth to authenticated, anon;
            create table public.members(id uuid primary key default gen_random_uuid(), user_id uuid references auth.users,
                role text default 'member', first_name text, last_name text, email text);
            alter table public.members enable row level security;
            grant select, insert, update on public.members to authenticated;
            create policy own_member on public.members to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
            insert into auth.users values ('${ADMIN}'),('${MEMBER}'),('${OTHER}'),('${OUTSIDER}');
            insert into public.members(user_id,role,first_name,last_name,email) values
              ('${ADMIN}','exec','Exec','Admin','exec@example.test'),
              ('${MEMBER}','member','Test','Member','member@example.test'),
              ('${OTHER}','member','Other','Member','other@example.test');
        `);
        await db.exec(await readFile(new URL('../supabase/migrations/202609240001_member_points.sql', import.meta.url), 'utf8'));
        const owner = () => db.exec('reset role;');
        const asUser = async (id) => {
            await db.exec('reset role; set role authenticated;');
            await db.query("select set_config('request.jwt.claim.sub',$1,false)", [id]);
        };
        const rpc = async (name, values = []) => {
            const result = await db.query(`select public.${name}(${values.map((_, i) => `$${i + 1}`).join(',')}) result`, values);
            return result.rows[0].result;
        };
        await asUser(ADMIN);
        let dashboard = await rpc('points_dashboard');
        const semester = dashboard.semester_id;
        let eventId = randomUUID();
        const eventArgs = (id = randomUUID(), criterion = 'first_gbm') => [id, semester, 'Test GBM', 'Engineering building', criterion, password, new Date(Date.now() - 60000).toISOString(), new Date(Date.now() + 3600000).toISOString()];
        await t.test('criteria match the supplied rules; initial semester and zero totals', () => {
            assert.equal(dashboard.semesters[0].name, 'Fall 2026');
            assert.equal(dashboard.summary.total, 0);
            assert.deepEqual(Object.fromEntries(dashboard.criteria.map(c => [c.code, c.points])), { first_gbm: 5, regular_gbm: 1, social_event: 1, professional_development: 2, instagram_repost: 1 });
        });
        await t.test('admin creates a password-hashed event; metadata never exposes hashes', async () => {
            const args = eventArgs(eventId);
            assert.equal(await rpc('points_create_event', args), eventId);
            assert.equal(await rpc('points_create_event', args), eventId);
            dashboard = await rpc('points_dashboard');
            assert.equal(dashboard.events.length, 1);
            assert(!JSON.stringify(dashboard).includes(password));
            assert(!JSON.stringify(dashboard).includes('password_hash'));
            await owner();
            const stored = (await db.query('select password_hash from points_private.events where id=$1', [eventId])).rows[0].password_hash;
            assert(stored.startsWith('$2')); assert.notEqual(stored,password);
        });
        await t.test('members cannot access tables, award points, create events, or promote themselves', async () => {
            await asUser(MEMBER);
            await assert.rejects(() => db.query('select * from points_private.events'), /permission denied/);
            await assert.rejects(() => db.query('select * from points_private.awards'), /permission denied/);
            await assert.rejects(() => rpc('points_create_event', eventArgs()), /Only executive/);
            await assert.rejects(() => rpc('points_award_manual', [randomUUID(),semester,MEMBER,'first_gbm',1,'fake',null]), /Only executive/);
            await assert.rejects(() => db.query("update public.members set role='exec' where user_id=$1",[MEMBER]), /Only admins/);
            await assert.rejects(() => db.query("insert into public.members(user_id,role) values($1,'exec')",[MEMBER]), /own member profile/);
        });
        await t.test('wrong password awards nothing; correct password awards once', async () => {
            const bad = await rpc('points_check_in',[eventId,'incorrect']); assert.equal(bad.ok,false);
            assert.equal((await rpc('points_dashboard')).summary.total,0);
            const good = await rpc('points_check_in',[eventId,password]); assert.equal(good.ok,true); assert.equal(good.points,5);
            assert.equal((await rpc('points_check_in',[eventId,password])).ok,false);
            dashboard = await rpc('points_dashboard');
            assert.equal(dashboard.summary.total,5); assert.equal(dashboard.summary.event_count,1);
            assert.equal(dashboard.awards.length,1); assert.equal(dashboard.events[0].claimed,true);
            assert.equal(dashboard.members,undefined); assert.equal(dashboard.recent_awards,undefined);
        });
        await t.test('members cannot see another member history or personal info', async () => {
            await asUser(OTHER);
            dashboard=await rpc('points_dashboard');
            assert.equal(dashboard.awards.length,0); assert.equal(dashboard.summary.total,0);
            assert(!JSON.stringify(dashboard).includes('member@example.test'));
            assert(!JSON.stringify(dashboard).includes(MEMBER));
        });
        await t.test('five bad passwords lock further attempts across events and persist', async () => {
            for(let i=0;i<5;i++) assert.equal((await rpc('points_check_in',[eventId,'incorrect'])).ok,false);
            assert.match((await rpc('points_check_in',[eventId,password])).message,/Too many/);
            await owner();
            await db.query("update points_private.attempts set window_started=now()-interval '16 minutes' where user_id=$1",[OTHER]);
            await asUser(OTHER);
            assert.equal((await rpc('points_check_in',[eventId,password])).ok,true);
        });
        let manualId;
        await t.test('admin awards exact criterion points times quantity; retries are idempotent', async () => {
            await asUser(ADMIN);
            const args=[randomUUID(),semester,MEMBER,'instagram_repost',3,'Three verified flyer reposts',null];
            manualId=await rpc('points_award_manual',args);
            assert.equal(await rpc('points_award_manual',args),manualId);
            await assert.rejects(() => rpc('points_award_manual',[args[0],semester,OTHER,'instagram_repost',3,args[5],null]),/submission ID/);
            await asUser(MEMBER);
            dashboard=await rpc('points_dashboard');
            assert.equal(dashboard.summary.total,8); assert.equal(dashboard.summary.event_count,1);
        });
        await t.test('event-linked manual awards and member check-ins cannot double count', async () => {
            await asUser(ADMIN);
            await assert.rejects(() => rpc('points_award_manual',[randomUUID(),semester,MEMBER,'first_gbm',1,'Attendance',eventId]),/already has attendance/);
            const id=randomUUID(); await rpc('points_create_event',eventArgs(id,'professional_development'));
            await rpc('points_award_manual',[randomUUID(),semester,MEMBER,'professional_development',1,'Attendance verified by admin',id]);
            await asUser(MEMBER);
            assert.equal((await rpc('points_check_in',[id,password])).ok,false);
            assert.equal((await rpc('points_dashboard')).summary.total,10);
        });
        await t.test('voiding preserves history and corrects totals without allowing reclaims', async () => {
            await assert.rejects(() => rpc('points_void_award',[manualId,'Unauthorized']),/Only executive/);
            await asUser(ADMIN);
            await rpc('points_void_award',[manualId,'Duplicate evidence; award removed']);
            await asUser(MEMBER);
            dashboard=await rpc('points_dashboard');
            assert.equal(dashboard.summary.total,7);
            assert(dashboard.awards.find(a=>a.id===manualId).voided_at);
            const attendanceId=dashboard.awards.find(a=>a.event_id===eventId).id;
            await asUser(ADMIN); await rpc('points_void_award',[attendanceId,'Incorrect attendance']);
            await asUser(MEMBER);
            assert.equal((await rpc('points_check_in',[eventId,password])).ok,false);
            assert.equal((await rpc('points_dashboard')).summary.total,2);
        });
        await t.test('new semesters separate totals; closing semesters blocks writes', async () => {
            await asUser(ADMIN);
            const next=await rpc('points_create_semester',['Spring 2027']);
            assert.equal((await rpc('points_dashboard',[next])).summary.total,0);
            await rpc('points_set_semester_open',[semester,false]);
            await assert.rejects(() => rpc('points_award_manual',[randomUUID(),semester,MEMBER,'regular_gbm',1,'Closed',null]),/open semester/);
            const id=randomUUID();
            await assert.rejects(() => rpc('points_create_event',eventArgs(id)),/open semester/);
            await rpc('points_set_semester_open',[semester,true]);
            await rpc('points_create_event',eventArgs(id));
            await rpc('points_set_event_open',[id,false]);
            await asUser(MEMBER);
            assert.match((await rpc('points_check_in',[id,password])).message,/closed/);
            assert.equal((await rpc('points_dashboard',[next])).summary.total,0);
        });
        await t.test('event time windows, criteria, quantity, and member IDs are validated', async () => {
            await asUser(ADMIN);
            await assert.rejects(() => rpc('points_create_event',eventArgs(randomUUID(),'instagram_repost')),/attendance criterion/);
            const args=eventArgs();args[5]='short';await assert.rejects(() => rpc('points_create_event',args),/6 and 72/);
            const future=eventArgs();future[6]=new Date(Date.now()+7200000).toISOString();future[7]=new Date(Date.now()+10800000).toISOString();
            await rpc('points_create_event',future);
            await assert.rejects(() => rpc('points_award_manual',[randomUUID(),semester,MEMBER,'regular_gbm',0,'bad',null]),/Quantity/);
            await assert.rejects(() => rpc('points_award_manual',[randomUUID(),semester,OUTSIDER,'regular_gbm',1,'bad',null]),/Member not found/);
            await assert.rejects(() => rpc('points_award_manual',[randomUUID(),semester,MEMBER,'regular_gbm',1,'',null]),/reason/);
            await assert.rejects(() => rpc('points_award_manual',[randomUUID(),semester,MEMBER,'regular_gbm',1,'bad',eventId]),/must match/);
            await asUser(MEMBER);assert.match((await rpc('points_check_in',[future[0],password])).message,/closed/);
        });
        await t.test('unauthenticated users and accounts without a member profile cannot use points', async () => {
            await asUser(OUTSIDER);await assert.rejects(() => rpc('points_dashboard'),/registered member/);
            await db.exec('reset role; set role anon;');
            await assert.rejects(() => rpc('points_dashboard'),/permission denied/);
            await assert.rejects(() => rpc('points_check_in',[eventId,password]),/permission denied/);
        });
        await t.test('deletion migration preserves existing events, awards, and totals', async () => {
            await asUser(ADMIN);
            const before = await rpc('points_dashboard', [semester]);
            await owner();
            await db.exec(await readFile(new URL('../supabase/migrations/202609260001_points_event_deletion.sql', import.meta.url), 'utf8'));
            await asUser(ADMIN);
            assert.deepEqual(await rpc('points_dashboard', [semester]), before);
        });
        await t.test('only admins can delete events, including in closed semesters', async () => {
            await asUser(MEMBER);
            await assert.rejects(() => rpc('points_delete_event', [eventId]), /Only executive/);
            await db.exec('reset role; set role anon;');
            await assert.rejects(() => rpc('points_delete_event', [eventId]), /permission denied/);
            await asUser(ADMIN);
            await assert.rejects(() => rpc('points_delete_event', [randomUUID()]), /Event not found/);
            await rpc('points_set_semester_open', [semester, false]);
            const before = await rpc('points_dashboard', [semester]);
            await rpc('points_delete_event', [eventId]);
            await rpc('points_delete_event', [eventId]);
            const after = await rpc('points_dashboard', [semester]);
            assert(!after.events.some(event => event.id === eventId));
            assert.equal(after.events.length, before.events.length - 1);
            assert.deepEqual(after.members, before.members);
            assert.deepEqual(after.recent_awards, before.recent_awards);
            await owner();
            const deleted = (await db.query('select deleted_at,deleted_by,is_open from points_private.events where id=$1', [eventId])).rows[0];
            assert(deleted.deleted_at);
            assert.equal(deleted.deleted_by, ADMIN);
            assert.equal(deleted.is_open, false);
            await asUser(ADMIN);
            await rpc('points_set_semester_open', [semester, true]);
        });
        await t.test('deleted events stay hidden and cannot be reopened or receive new awards', async () => {
            await asUser(ADMIN);
            await assert.rejects(() => rpc('points_set_event_open', [eventId, true]), /Event not found/);
            await assert.rejects(() => rpc('points_create_event', eventArgs(eventId)), /has been deleted/);
            await assert.rejects(() => rpc('points_award_manual', [randomUUID(),semester,ADMIN,'first_gbm',1,'Deleted event',eventId]), /must match/);
            await asUser(MEMBER);
            const dashboard = await rpc('points_dashboard', [semester]);
            assert(!dashboard.events.some(event => event.id === eventId));
            assert(dashboard.awards.some(award => award.event_id === eventId));
            assert.equal(dashboard.summary.total, 2);
            assert.equal((await rpc('points_check_in', [eventId, password])).ok, false);
            await asUser(ADMIN);
            assert.match((await rpc('points_check_in', [eventId, password])).message, /Event not found/);
            // New event creation and check-in still work with the updated RPCs.
            const newEvent = randomUUID();
            await rpc('points_create_event', eventArgs(newEvent));
            await asUser(MEMBER);
            assert.equal((await rpc('points_check_in', [newEvent, password])).ok, true);
            const before = await rpc('points_dashboard', [semester]);
            await asUser(ADMIN);
            await rpc('points_delete_event', [newEvent]);
            await asUser(MEMBER);
            const after = await rpc('points_dashboard', [semester]);
            assert.deepEqual(after.summary, before.summary);
            assert.deepEqual(after.awards, before.awards);
            assert(!after.events.some(event => event.id === newEvent));
        });
    } finally { await db.close(); }
});
