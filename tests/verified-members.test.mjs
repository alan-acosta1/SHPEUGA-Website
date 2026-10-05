import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";
import { PGlite } from "@electric-sql/pglite";

const migration = fs.readFileSync(new URL("../supabase/migrations/202610050001_verified_member_signup.sql", import.meta.url), "utf8");
const id = (number) => `00000000-0000-0000-0000-${String(number).padStart(12, "0")}`;
const profile = { first_name: " Ana ", last_name: " Engineer ", major: " Computer Science ", school_year: "3", school_id: "810123456" };

async function addUser(db, number, metadata = profile, extra = {}) {
    await db.query(`insert into auth.users (id, email, raw_user_meta_data, email_confirmed_at, is_anonymous)
        values ($1, $2, $3, $4, $5)`, [id(number), extra.email ?? `student${number}@uga.edu`, metadata, extra.confirmed ? "2026-10-05T12:00:00Z" : null, extra.anonymous ?? false]);
}

async function asUser(db, number, query, role = "authenticated") {
    return db.transaction(async (tx) => {
        await tx.exec(`set local role ${role}`);
        await tx.query("select set_config('request.jwt.claim.sub', $1, true)", [number === null ? "" : id(number)]);
        return tx.query(query);
    });
}

for (const columnType of ["text", "integer"]) {
    test(`verified member migration works with ${columnType} student columns`, async (t) => {
        const db = new PGlite();
        try {
            await db.exec(`
                create role anon nologin;
                create role authenticated nologin;
                create schema auth;
                create table auth.users (
                    id uuid primary key,
                    email text,
                    raw_user_meta_data jsonb not null default '{}',
                    email_confirmed_at timestamptz,
                    is_anonymous boolean default false
                );
                create function auth.uid() returns uuid language sql stable as $$
                    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
                $$;
                grant usage on schema auth to anon, authenticated;
                create table public.members (
                    id bigint generated always as identity primary key,
                    user_id uuid unique references auth.users(id),
                    email text not null,
                    first_name text not null,
                    last_name text not null,
                    major text not null,
                    school_year ${columnType} not null,
                    school_id ${columnType} not null,
                    role text not null
                );
                grant select, insert, update, delete on public.members to anon, authenticated;
                grant usage on sequence public.members_id_seq to anon, authenticated;
                -- Deliberately broad legacy policies: the migration must tighten
                -- them even when they would otherwise allow anonymous requests.
                create policy existing_member_access on public.members
                    for all to anon, authenticated using (true) with check (true);
            `);
            await addUser(db, 90, {}, { confirmed: true });
            await db.exec(`insert into public.members (user_id, email, first_name, last_name, major, school_year, school_id, role)
                values ('${id(90)}', 'student90@uga.edu', 'Existing', 'Exec', 'Engineering', '4', '810654321', 'exec');`);
            await addUser(db, 91, {});
            await db.exec(`insert into public.members (user_id, email, first_name, last_name, major, school_year, school_id, role)
                values ('${id(91)}', 'student91@uga.edu', 'Legacy', 'Pending', 'Engineering', '2', '810987654', 'member');`);

            await t.test("migration applies and can be rerun without losing existing roles", async () => {
                await db.exec(migration);
                await db.exec(migration);
                const { rows } = await db.query("select role from public.members where user_id = $1", [id(90)]);
                assert.equal(rows[0].role, "exec");
            });

            await t.test("signup stores no public member profile before confirmation", async () => {
                await addUser(db, 1, { ...profile, role: "exec" });
                const { rows } = await db.query("select * from public.members where user_id = $1", [id(1)]);
                assert.equal(rows.length, 0);
            });

            await t.test("automatic confirmation creates a member profile immediately without an email step", async () => {
                await addUser(db, 2, { ...profile, role: "exec" }, { confirmed: true });
                const { rows } = await db.query("select * from public.members where user_id = $1", [id(2)]);
                assert.equal(rows.length, 1);
                assert.equal(rows[0].role, "member");
                assert.equal(rows[0].first_name, "Ana");
                assert.equal((await asUser(db, 2, `select * from public.members where user_id = '${id(2)}'`)).rows.length, 1);
            });

            await t.test("anonymous and unverified requests cannot read existing member data", async () => {
                assert.equal((await asUser(db, null, "select * from public.members", "anon")).rows.length, 0);
                assert.equal((await asUser(db, 1, "select * from public.members")).rows.length, 0);
                assert.equal((await asUser(db, 1, "update public.members set major = 'Spoofed' returning id")).rows.length, 0);
                assert.equal((await asUser(db, 1, "delete from public.members returning id")).rows.length, 0);
            });

            await t.test("verification creates one member and ignores a spoofed executive role", async () => {
                await db.query("update auth.users set email_confirmed_at = now() where id = $1", [id(1)]);
                const { rows } = await db.query("select * from public.members where user_id = $1", [id(1)]);
                assert.equal(rows.length, 1);
                assert.equal(rows[0].first_name, "Ana");
                assert.equal(rows[0].last_name, "Engineer");
                assert.equal(rows[0].major, "Computer Science");
                assert.equal(String(rows[0].school_year), "3");
                assert.equal(String(rows[0].school_id), "810123456");
                assert.equal(rows[0].role, "member");
            });

            await t.test("verification replay and metadata updates do not duplicate or elevate members", async () => {
                await db.query("update auth.users set email_confirmed_at = now(), raw_user_meta_data = $2 where id = $1", [id(1), { ...profile, role: "exec" }]);
                const { rows } = await db.query("select role from public.members where user_id = $1", [id(1)]);
                assert.equal(rows.length, 1);
                assert.equal(rows[0].role, "member");
            });

            await t.test("verified members retain access through existing RLS policies", async () => {
                const { rows } = await asUser(db, 1, "select * from public.members");
                assert.ok(rows.some((row) => row.user_id === id(1)));
                assert.ok((await asUser(db, 90, "select * from public.members")).rows.length > 0);
            });

            await t.test("browser inserts are denied even for verified users", async () => {
                const query = `insert into public.members (user_id, email, first_name, last_name, major, school_year, school_id, role)
                    values ('${id(1)}', 'fake@uga.edu', 'Fake', 'Profile', 'Fake', '3', '810111111', 'exec')`;
                for (const [actor, role] of [[null, "anon"], [91, "authenticated"], [1, "authenticated"]]) {
                    await assert.rejects(asUser(db, actor, query, role), /row-level security/);
                }
            });

            await t.test("invalid profiles fail confirmation atomically", async () => {
                const invalid = [
                    { metadata: { ...profile, first_name: " " } },
                    { metadata: { ...profile, school_id: "123" } },
                    { metadata: { ...profile, school_year: "30" } },
                    { metadata: {} },
                    { metadata: profile, email: "outsider@example.com" },
                ];
                for (const [index, input] of invalid.entries()) {
                    const number = 10 + index;
                    await addUser(db, number, input.metadata, { email: input.email });
                    await assert.rejects(db.query("update auth.users set email_confirmed_at = now() where id = $1", [id(number)]), /UGA email and complete member profile/);
                    const { rows } = await db.query("select email_confirmed_at from auth.users where id = $1", [id(number)]);
                    assert.equal(rows[0].email_confirmed_at, null);
                    assert.equal((await db.query("select * from public.members where user_id = $1", [id(number)])).rows.length, 0);
                }
            });

            await t.test("legacy pending members can verify without metadata and keep their profiles", async () => {
                await db.query("update auth.users set email_confirmed_at = now() where id = $1", [id(91)]);
                const { rows } = await db.query("select * from public.members where user_id = $1", [id(91)]);
                assert.equal(rows.length, 1);
                assert.equal(rows[0].first_name, "Legacy");
            });

            await t.test("anonymous auth accounts cannot access member data", async () => {
                await addUser(db, 30, profile, { confirmed: true, anonymous: true });
                assert.equal((await asUser(db, 30, "select * from public.members")).rows.length, 0);
            });
        } finally {
            await db.close();
        }
    });
}
