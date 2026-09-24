# Member points — setup and testing

This feature uses the website's existing Supabase Auth accounts and `public.members` profiles. It is implemented on the local `codex/member-points` branch, based on the deployed `Main` design. It has **not** been deployed and no live database changes have been made.

## 1. Set up Supabase

Open the Supabase project used by your local `.env`. For isolated testing, use a separate Supabase project with the same `members` table and test accounts, and point local `.env` at it.

1. Open **SQL Editor → New query** in the Supabase dashboard.
2. Paste the entire contents of [`../supabase/migrations/202609240001_member_points.sql`](../supabase/migrations/202609240001_member_points.sql).
3. Run it **once**, as the project database owner. The migration runs in a transaction; a failure rolls it back. If it reports an existing points table/function, check whether setup has already been completed instead of deleting data.
4. The setup creates Fall 2026 automatically. Keep `points_private` out of Supabase's exposed schemas. Only the authenticated RPCs in `public` need to be exposed.

The SQL uses existing `members.user_id`, `role`, `first_name`, `last_name`, and `email` columns. `user_id` must link to the user's Supabase Auth UUID. Existing executive board accounts with `members.role = 'exec'` become points admins. Members must have registered profiles before using points. No service-role key is required in the website.

The migration adds a trigger preventing members from changing their own role/account link or registering as an exec through the members API. Existing exec admins can still manage member roles; owner SQL maintenance is unaffected. Existing members RLS policies continue to protect the rest of the profile data.

**Using the live Supabase project for this step changes that database immediately**, even while the UI is only running locally. Test events and awards persist in whichever project you select. No screenshot member data is imported by this feature.

## 2. Start the local website

```sh
cd /Users/alanacosta/uga_shpe_website/.worktrees/live-mobile
npm install
npm run dev -- --port 3001
```

If port 3001 is already running, use that preview. Restart the server after changing `.env`.

- Member view: http://localhost:3001/points
- Admin view: http://localhost:3001/admin/points
- The navigation has a **Points** link on desktop and mobile.
- **Admin → Manage Points** opens event creation, awards, totals, history, and semesters.

Before SQL setup, signed-in users see “Points are not available yet.” The admin screen explains the setup requirement. Guests see the criteria and a sign-in link. This is a real Supabase-backed feature, not demo data.

## 3. Test with one admin and one member

Use separate browser profiles or a private window to avoid mixing sessions. Never award points to real members just to test the feature.

1. Sign in as an exec. Open **Manage points → Events**.
2. Create an event with a title, criterion, password of 6–72 bytes, and check-in window covering the current time. Save the password yourself before submitting: it is stored as a salted bcrypt hash and is never displayed again. Times entered in forms use your device timezone; event listings display Eastern Time.
3. In the member session, open **Points**. Enter a wrong password and confirm no points are added. Enter the correct password and confirm the award appears. Try checking in again: attendance can only be recorded once per member/event.
4. As the admin, use **Award points** for an Instagram repost. Select the member, choose Instagram Flyer Repost, quantity 1, and give a verification note. The member's total should increase by 1 without increasing events attended.
5. For manually recorded attendance at an event already created in the system, select **Linked event**. This shares the same duplicate check as member check-in. Use standalone awards for activities not listed as events or verified reposts. Each new standalone submission is intentionally a new award; network retries reuse a submission ID.
6. Use **Award history → Correct this award**, give a reason, and void an incorrect award. It stays in history but is removed from totals. Voiding event attendance does not reopen self-check-in for that event. If it needs to be restored, an admin can add a clearly noted standalone correction.
7. Create **Spring 2027** under **Semesters**, then select it in the semester menu. Totals start at zero; Fall 2026 history remains available.
8. Close a semester and confirm it blocks event creation, check-ins, and new manual awards. Reopen it to resume. History and corrections remain available while closed.
9. Test the member view at phone width. Ensure it cannot open admin controls or access another member's history.

## Scoring

| Criterion | Points per occurrence | Counts as attendance |
| --- | ---: | --- |
| First GBM | 5 | Yes |
| Regular GBM | 1 | Yes |
| Social/Event | 1 | Yes |
| Professional Development Event | 2 | Yes |
| Instagram Flyer Repost | 1 | No |

Each event uses one criterion. “First GBM” is the activity type for the semester's first meeting, not an automatic first-visit bonus. Admins choose that type for the corresponding event. Manual awards can apply a quantity from 1 to 100; event-linked attendance is always quantity 1. Event/password awards use the database-defined value, never a client-supplied point amount.

Totals and ranks include all active awards in the selected semester. Rank uses competition ranking: equal totals share a rank, and the next rank skips positions (1, 1, 3). Members see only their own totals, rank, and latest 200 history entries. Admins can see all registered member totals and the latest 500 award entries. Closing a semester preserves its records.

## Protection and automated checks

- All operations require a registered member; management RPCs additionally require the existing exec role.
- Points tables and password hashes are private, with RLS enabled and no direct browser table grants.
- Password failures are limited to five per member in a 15-minute window, across events. Wait for the window to expire after testing the limit.
- Unique database constraints prevent duplicate event attendance. Manual submission IDs prevent double points on retries.
- Point values, time windows, criterion/event matching, and member IDs are checked inside PostgreSQL.
- Voiding retains original award, actor, timestamp, and correction reason.

```sh
npm run test:points
npm run lint
npm run build
```

`test:points` uses PGlite (local PostgreSQL with pgcrypto) and disposable synthetic accounts. It executes the same SQL migration and never connects to your Supabase project. It tests permissions, password hashing/check-in, duplicates, manual awards, corrections, semesters, and private member data. Browser flows were also tested against a disposable local PostgreSQL database with test authentication. Testing with your own Supabase project is the final integration check.

Database security reference: [Supabase database functions](https://supabase.com/docs/guides/database/functions).
Local database test runtime: [PGlite extensions](https://pglite.dev/extensions/).
