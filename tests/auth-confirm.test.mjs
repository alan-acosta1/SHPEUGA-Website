import assert from "node:assert/strict";
import { test } from "node:test";
import { NextRequest } from "next/server.js";
import loadTypescript from "./load-typescript.mjs";

function callback(result, throws = false) {
    const calls = [];
    const auth = {
        verifyOtp: async (input) => {
            calls.push({ method: "verifyOtp", ...input });
            if (throws) throw new Error("Network failure");
            return result;
        },
        exchangeCodeForSession: async (code) => {
            calls.push({ method: "exchangeCodeForSession", code });
            return result;
        },
        signOut: async () => calls.push({ method: "signOut" }),
    };
    const { GET } = loadTypescript("app/auth/confirm/route.ts", {
        "@/utils/supabase/server": { createClient: async () => ({ auth }) },
    });
    return {
        calls,
        request: (query) => GET(new NextRequest(`https://shpeuga.com/auth/confirm${query}`)),
    };
}

const verified = {
    data: { user: { email_confirmed_at: "2026-10-05T12:00:00Z" }, session: {} },
    error: null,
};

test("signup tokens establish the session and discard all URL parameters", async () => {
    for (const type of ["email", "signup"]) {
        const flow = callback(verified);
        const response = await flow.request(`?token_hash=secret&type=${type}&next=https://attacker.example`);
        assert.equal(response.headers.get("location"), "https://shpeuga.com/profile");
        assert.equal(flow.calls[0].type, type);
        assert.equal(flow.calls[0].token_hash, "secret");
        assert.equal(response.headers.get("cache-control"), "private, no-store");
        assert.equal(response.headers.get("referrer-policy"), "no-referrer");
    }
});

test("missing tokens, recovery tokens, unknown types and provider errors cannot confirm signup", async () => {
    for (const query of ["", "?token_hash=secret", "?type=email", "?token_hash=secret&type=recovery", "?token_hash=secret&type=unknown", "?token_hash=secret&type=email&error=access_denied"]) {
        const flow = callback(verified);
        const response = await flow.request(query);
        assert.equal(response.headers.get("location"), "https://shpeuga.com/confirmemail?error=invalid_link");
        assert.equal(flow.calls.length, 0);
    }
});

test("default-template PKCE codes can establish a verified session", async () => {
    const flow = callback(verified);
    const response = await flow.request("?code=pkce-secret&next=//attacker.example");
    assert.equal(response.headers.get("location"), "https://shpeuga.com/profile");
    assert.equal(flow.calls[0].method, "exchangeCodeForSession");
    assert.equal(flow.calls[0].code, "pkce-secret");
});

test("expired, reused and failed exchanges return to the resend page without secrets", async () => {
    for (const query of ["?token_hash=secret&type=email", "?code=secret"]) {
        const flow = callback({ data: { user: null, session: null }, error: { code: "otp_expired" } });
        const response = await flow.request(query);
        assert.equal(response.headers.get("location"), "https://shpeuga.com/confirmemail?error=invalid_link");
    }
});

test("an unverified returned session is signed out", async () => {
    const flow = callback({ data: { user: { email_confirmed_at: null }, session: {} }, error: null });
    const response = await flow.request("?token_hash=secret&type=email");
    assert.equal(response.headers.get("location"), "https://shpeuga.com/confirmemail?error=invalid_link");
    assert.equal(flow.calls.at(-1).method, "signOut");
});

test("network failures give a recoverable confirmation error", async () => {
    const flow = callback(null, true);
    const response = await flow.request("?token_hash=secret&type=email");
    assert.equal(response.headers.get("location"), "https://shpeuga.com/confirmemail?error=invalid_link");
});
