import assert from "node:assert/strict";
import { test } from "node:test";
import { NextRequest } from "next/server.js";
import loadTypescript from "./load-typescript.mjs";

function proxy(user, role = "member") {
    let roleChecks = 0;
    const { updateSession } = loadTypescript("utils/supabase/middleware.ts", {
        "@supabase/ssr": {
            createServerClient: (_url, _key, { cookies }) => ({
                auth: {
                    getUser: async () => {
                        cookies.setAll([{ name: "refreshed-session", value: "new-token", options: { httpOnly: true, path: "/" } }]);
                        return { data: { user } };
                    },
                },
                from: () => ({ select: () => ({ eq: () => ({
                    single: async () => { roleChecks++; return { data: { role } }; },
                }) }) }),
            }),
        },
    });
    return {
        request: (pathname) => updateSession(new NextRequest(`https://shpeuga.com${pathname}`)),
        roleChecks: () => roleChecks,
    };
}

test("anonymous visitors cannot open member or admin routes", async () => {
    for (const path of ["/profile", "/profile/edit", "/admin", "/admin/manageMembers"]) {
        const flow = proxy(null);
        const response = await flow.request(path);
        assert.equal(response.headers.get("location"), "https://shpeuga.com/login");
        assert.equal(response.cookies.get("refreshed-session").value, "new-token");
    }
});

test("unverified users cannot reach member data or trigger executive role checks", async () => {
    for (const path of ["/profile", "/admin/manageMembers"]) {
        const flow = proxy({ id: "pending", email_confirmed_at: null }, "exec");
        const response = await flow.request(path);
        assert.equal(response.headers.get("location"), "https://shpeuga.com/confirmemail");
        assert.equal(flow.roleChecks(), 0);
    }
});

test("verified members can open their profile but executive checks still protect admin routes", async () => {
    const user = { id: "verified", email_confirmed_at: "2026-10-05T12:00:00Z" };
    const member = proxy(user);
    assert.equal((await member.request("/profile")).status, 200);
    const rejected = await member.request("/admin/manageMembers");
    assert.equal(rejected.headers.get("location"), "https://shpeuga.com/");
    assert.equal(rejected.cookies.get("refreshed-session").value, "new-token");
    const exec = proxy(user, "exec");
    assert.equal((await exec.request("/admin/manageMembers")).status, 200);
});

test("public pages and verification remain accessible without a session", async () => {
    for (const path of ["/", "/signup", "/login", "/confirmemail", "/auth/confirm?token_hash=secret&type=email", "/resetpassword"]) {
        assert.equal((await proxy(null).request(path)).status, 200);
    }
});
