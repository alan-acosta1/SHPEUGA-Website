"use client";

import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import { Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const links = [
    { href: "/about", label: "Our chapter" },
    { href: "/board", label: "The board" },
    { href: "/event", label: "Events" },
    { href: "/sponser", label: "Sponsors" },
];

export default function NavBar() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false);
    const [signingOut, setSigningOut] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const { role } = useAuth();

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user);
            setLoading(false);
        });
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });
        return () => subscription.unsubscribe();
    }, []);

    const handleSignout = async () => {
        setSigningOut(true);
        const supabase = createClient();
        const { error } = await supabase.auth.signOut();
        setSigningOut(false);
        if (!error) {
            setUser(null);
            setMenuOpen(false);
            router.push("/");
            router.refresh();
        }
    };

    const memberLinks = user
        ? [{ href: "/profile", label: "Profile" }, ...(role === "exec" ? [{ href: "/admin", label: "Admin" }] : [])]
        : [];

    return (
        <header className="site-nav fixed inset-x-0 top-0 z-40">
            <nav className="site-container flex h-full items-center justify-between gap-6" aria-label="Main navigation">
                <Link href="/" aria-label="UGA SHPE home" className="shrink-0">
                    <Image src="/images/shpe_whiteHorzi.png" alt="SHPE at the University of Georgia" width={210} height={54} className="h-auto w-44 lg:w-48" priority />
                </Link>
                <div className="hidden items-center gap-7 lg:flex">
                    {[...links, ...memberLinks].map((link) => (
                        <Link key={link.href} href={link.href} className="nav-link" aria-current={pathname === link.href ? "page" : undefined}>
                            {link.label}
                        </Link>
                    ))}
                </div>
                <div className="flex items-center gap-3">
                    {!loading && (user ? (
                        <button onClick={handleSignout} disabled={signingOut} className="hidden rounded border border-white/30 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:opacity-50 lg:block">
                            {signingOut ? "Signing out…" : "Sign out"}
                        </button>
                    ) : (
                        <Link href="/login" className="hidden rounded bg-[#f27832] px-5 py-2.5 text-sm font-semibold text-[#101c35] transition-colors hover:bg-[#ff9d62] lg:block">
                            Member login
                        </Link>
                    ))}
                    <button onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} aria-controls="mobile-navigation" className="rounded p-2 text-white lg:hidden">
                        {menuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </nav>
            {menuOpen && (
                <nav id="mobile-navigation" aria-label="Mobile navigation" className="max-h-[calc(100dvh-76px)] overflow-y-auto border-t border-white/15 bg-[#101c35] px-5 py-5 shadow-xl lg:hidden">
                    {[...links, ...memberLinks].map((link) => (
                        <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="block border-b border-white/10 py-3 text-base text-white" aria-current={pathname === link.href ? "page" : undefined}>
                            {link.label}
                        </Link>
                    ))}
                    {!loading && (user ? (
                        <button onClick={handleSignout} disabled={signingOut} className="button-primary mt-5 w-full">
                            {signingOut ? "Signing out…" : "Sign out"}
                        </button>
                    ) : (
                        <Link href="/login" onClick={() => setMenuOpen(false)} className="button-primary mt-5 w-full">Member login</Link>
                    ))}
                </nav>
            )}
        </header>
    );
}
