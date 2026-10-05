"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function ConfirmEmail({ invalidLink = false }: { invalidLink?: boolean }) {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = window.setTimeout(() => setCooldown(cooldown - 1), 1000);
        return () => window.clearTimeout(timer);
    }, [cooldown]);

    const handleResend = async (event: React.FormEvent) => {
        event.preventDefault();
        if (loading || cooldown > 0) return;
        setError(null);
        setMessage("");
        const normalizedEmail = email.trim().toLowerCase();
        if (!/^[^\s@]+@uga\.edu$/.test(normalizedEmail)) {
            setError("Please enter your UGA email address.");
            return;
        }

        setLoading(true);
        try {
            const { error } = await createClient().auth.resend({
                type: "signup",
                email: normalizedEmail,
                options: { emailRedirectTo: `${window.location.origin}/auth/confirm` },
            });
            if (error) {
                setError(error.status === 429
                    ? "Please wait a minute before requesting another email."
                    : "Unable to resend the email. Please try again later.");
                if (error.status === 429) setCooldown(60);
                return;
            }
            setMessage("If this account is waiting for verification, a new link has been sent. Please check your inbox and spam folder.");
            setCooldown(60);
        } catch {
            setError("Unable to resend the email. Please check your connection and try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto w-full max-w-md rounded-lg bg-white p-5 shadow-md sm:p-8">
            {invalidLink && (
                <p role="alert" className="mb-5 text-sm text-red-600">
                    This verification link is invalid or has expired. Request a new link below, or log in if you already verified your email.
                </p>
            )}
            <p className="mb-6 text-sm leading-6 text-gray-600">
                Follow the link in your confirmation email to activate your account.
                Check your spam folder if it hasn’t arrived. You need to verify your
                email before accessing your member profile.
            </p>
            <form onSubmit={handleResend} className="flex flex-col gap-4">
                <div>
                    <label htmlFor="confirmation-email" className="text-sm font-medium text-gray-700">UGA Email</label>
                    <input
                        id="confirmation-email"
                        type="email"
                        autoComplete="email"
                        autoCapitalize="none"
                        spellCheck={false}
                        required
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="you@uga.edu"
                        className="mt-1 w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                </div>
                {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
                {message && <p role="status" className="text-sm text-green-700">{message}</p>}
                <button type="submit" disabled={loading || cooldown > 0} className="w-full rounded-md bg-red-500 py-2 text-white transition-colors hover:bg-red-600 disabled:opacity-50">
                    {loading ? "Sending…" : cooldown > 0 ? `Resend in ${cooldown}s` : "Resend verification email"}
                </button>
            </form>
            <p className="mt-5 text-center text-sm text-gray-600">
                Already verified? <Link href="/login" className="text-red-500 hover:underline">Log in</Link>
            </p>
            <p className="mt-3 text-center text-sm text-gray-600">
                Used the wrong email? <Link href="/signup" className="text-red-500 hover:underline">Sign up again</Link>
            </p>
        </div>
    );
}
