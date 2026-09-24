import { createBrowserClient } from "@supabase/ssr";
import { navigatorLock, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

type BrowserCache = typeof globalThis & {
  __shpeSupabase?: { url: string; key: string; client: SupabaseClient };
};

export const createClient = () => {
  // Keep one client even across development Fast Refresh. Never cache a
  // browser client on the server, where requests belong to different users.
  const browser = globalThis as BrowserCache;
  if (typeof window !== "undefined" && browser.__shpeSupabase?.url === supabaseUrl && browser.__shpeSupabase.key === supabaseKey) {
    return browser.__shpeSupabase.client;
  }
  const client = createBrowserClient(supabaseUrl, supabaseKey, {
    isSingleton: false,
    // Retain cross-tab locking while allowing slow refresh requests more than
    // the SDK's five-second acquisition window before recovery kicks in.
    auth: {
      lock: typeof navigator !== "undefined" && navigator.locks
        ? (name, timeout, operation) => navigatorLock(name, timeout > 0 ? Math.max(timeout, 30000) : timeout, operation)
        : undefined,
    },
  });
  if (typeof window !== "undefined") browser.__shpeSupabase = { url: supabaseUrl, key: supabaseKey, client };
  return client;
};
