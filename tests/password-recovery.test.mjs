import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const source = readFileSync(new URL("../utils/supabase/password-recovery.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } });
const { readRecoveryLink, updateRecoveredPassword, invalidRecoveryMessage } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);

test("reads an unverified token from the fragment, never from a server-visible query", () => {
  assert.deepEqual(readRecoveryLink("#recovery_token=test-token", ""), { tokenHash: "test-token", error: null });
  assert.equal(readRecoveryLink("", "?recovery_token=test-token").tokenHash, null);
  assert.equal(readRecoveryLink("#error=access_denied", "").error, invalidRecoveryMessage);
  assert.equal(readRecoveryLink("", "?error=access_denied").error, invalidRecoveryMessage);
});

test("a rejected recovery token cannot update an already signed-in account", async () => {
  const auth = {
    verifyOtp: async () => ({ data: { session: null }, error: { message: "expired" } }),
    updateUser: async () => { assert.fail("must not update a password after rejected verification"); },
  };
  assert.equal(await updateRecoveredPassword(auth, "invalid", "new-password", () => assert.fail()), invalidRecoveryMessage);
});

test("verification without a session cannot update a password", async () => {
  const auth = {
    verifyOtp: async () => ({ data: { session: null }, error: null }),
    updateUser: async () => { assert.fail("a session is required"); },
  };
  assert.equal(await updateRecoveredPassword(auth, "token", "new-password", () => assert.fail()), invalidRecoveryMessage);
});

test("verifies with recovery type before changing a password", async () => {
  const calls = [];
  const auth = {
    verifyOtp: async (input) => {
      calls.push(["verify", input]);
      return { data: { session: {} }, error: null };
    },
    updateUser: async (input) => { calls.push(["update", input]); return { error: null }; },
  };
  assert.equal(await updateRecoveredPassword(auth, "token", "new-password", () => calls.push(["verified"])), null);
  assert.deepEqual(calls, [
    ["verify", { token_hash: "token", type: "recovery" }],
    ["verified"],
    ["update", { password: "new-password" }],
  ]);
});

test("password-policy errors can be corrected without reusing a consumed token", async () => {
  let token = "token";
  let verifications = 0;
  let updates = 0;
  const auth = {
    verifyOtp: async () => { verifications++; return { data: { session: {} }, error: null }; },
    updateUser: async () => ({ error: ++updates === 1 ? { message: "Choose a different password" } : null }),
  };
  assert.equal(await updateRecoveredPassword(auth, token, "password-one", () => { token = null; }), "Choose a different password");
  assert.equal(await updateRecoveredPassword(auth, token, "password-two", () => assert.fail()), null);
  assert.equal(verifications, 1);
  assert.equal(updates, 2);
});
