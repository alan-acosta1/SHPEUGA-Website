import type { SupabaseClient } from "@supabase/supabase-js";

export const invalidRecoveryMessage = "This reset link is invalid or has already been used. Please request another reset email.";

export function readRecoveryLink(hash: string, search: string) {
  const fragment = new URLSearchParams(hash.replace(/^#/, ""));
  const query = new URLSearchParams(search.replace(/^\?/, ""));
  // Use a custom fragment key so the SDK and link scanners cannot verify it
  // automatically. Always use the fixed recovery type when submitting it.
  return {
    tokenHash: fragment.get("recovery_token"),
    error: fragment.has("error") || query.has("error") ? invalidRecoveryMessage : null,
  };
}

export async function updateRecoveredPassword(
  auth: Pick<SupabaseClient["auth"], "verifyOtp" | "updateUser">,
  tokenHash: string | null,
  password: string,
  onVerified: () => void,
) {
  if (tokenHash) {
    const { data, error } = await auth.verifyOtp({ token_hash: tokenHash, type: "recovery" });
    if (error || !data.session) return invalidRecoveryMessage;
    // Verification consumes the token. Preserve the resulting session so a
    // password-policy failure can be corrected without reusing that token.
    onVerified();
  }
  const { error } = await auth.updateUser({ password });
  return error?.message ?? null;
}
