"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";

type AuthState = { user: User | null; loading: boolean; role: string | null };
const AuthContext = createContext<AuthState>({ user: null, loading: true, role: null });

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<{ user: User | null; loading: boolean }>({ user: null, loading: true });
    const [memberRole, setMemberRole] = useState<{ userId: string; role: string | null } | null>(null);
    const userId = session.user?.id;

    useEffect(() => {
        // INITIAL_SESSION supplies the stored session; do not fetch the user
        // again in every component. Keep this callback synchronous: Supabase
        // invokes it while holding its authentication lock.
        const { data: { subscription } } = createClient().auth.onAuthStateChange((_event, nextSession) => {
            const user = nextSession?.user;
            setSession({ user: user?.email_confirmed_at ? user : null, loading: false });
        });
        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (!userId) return;
        let cancelled = false;
        const loadRole = async () => {
            try {
                const { data, error } = await createClient().from("members").select("role").eq("user_id", userId).single();
                if (!cancelled) setMemberRole({ userId, role: error ? null : data?.role ?? null });
            } catch {
                if (!cancelled) setMemberRole({ userId, role: null });
            }
        };
        void loadRole();
        return () => { cancelled = true; };
    }, [userId]);

    // The session drives browser UI only. Server routes and SQL/RLS continue
    // to verify identity and permissions independently.
    const role = userId && memberRole?.userId === userId ? memberRole.role : null;
    return <AuthContext.Provider value={{ ...session, role }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
