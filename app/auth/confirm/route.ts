import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const tokenHash = searchParams.get("token_hash");
    const type = searchParams.get("type");
    const code = searchParams.get("code");
    const destination = new URL("/login", request.url);

    // Preserve previously sent signup links; recovery links use /resetpassword.
    if (!searchParams.has("error") && (
        (tokenHash && (type === "email" || type === "signup")) ||
        (code && !tokenHash)
    )) {
        const supabase = await createClient();
        try {
            const { data, error } = tokenHash
                ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as "email" | "signup" })
                : await supabase.auth.exchangeCodeForSession(code!);

            if (!error && data.user?.email_confirmed_at) {
                // A fixed destination prevents open redirects and removes tokens
                // from the URL. The server client saves the session in cookies.
                destination.pathname = "/profile";
                destination.search = "";
            } else if (data.session) {
                await supabase.auth.signOut();
            }
        } catch {
            // Previously issued invalid links return to normal login.
        }
    }

    const response = NextResponse.redirect(destination);
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set("Referrer-Policy", "no-referrer");
    return response;
}
