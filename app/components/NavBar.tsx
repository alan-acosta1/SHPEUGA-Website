"use client";

import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const links = [
    { href: "/board", label: "Board" },
    { href: "/about", label: "About" },
    { href: "/event", label: "Events" },
    { href: "/sponser", label: "Sponsors" },
    { href: "/points", label: "Points" },
];

export default function NavBar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [signingOut, setSigningOut] = useState(false);
    const headerRef = useRef<HTMLElement>(null);
    const toggleRef = useRef<HTMLButtonElement>(null);
    const router = useRouter();
    const pathname = usePathname();
    const { user, loading, role } = useAuth();
    const [signoutError, setSignoutError] = useState("");

    useEffect(() => {
        if (!menuOpen) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setMenuOpen(false);
                toggleRef.current?.focus();
            }
        };
        const onPointerDown = (event: PointerEvent) => {
            if (event.target instanceof Node && !headerRef.current?.contains(event.target)) setMenuOpen(false);
        };
        const desktop = window.matchMedia("(min-width: 1280px)");
        const onResize = () => { if (desktop.matches) setMenuOpen(false); };
        document.addEventListener("keydown", onKeyDown);
        document.addEventListener("pointerdown", onPointerDown);
        desktop.addEventListener("change", onResize);
        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.removeEventListener("pointerdown", onPointerDown);
            desktop.removeEventListener("change", onResize);
        };
    }, [menuOpen]);

    const handleSignout = async () => {
        setSigningOut(true);
        setSignoutError("");
        try {
            const { error } = await createClient().auth.signOut();
            if (error) throw error;
            setMenuOpen(false);
            router.push("/");
            router.refresh();
        } catch {
            setSignoutError("Could not sign out. Please try again.");
        } finally { setSigningOut(false); }
    };
    const navigation = [...links, ...(user ? [{ href: "/profile", label: "Profile" }] : []), ...(user && role === "exec" ? [{ href: "/admin", label: "Admin page" }] : [])];
    const accountAction = !loading && (user ? (
        <button type="button" disabled={signingOut} onClick={handleSignout} className="min-h-11 rounded-md bg-orange-600 px-4 py-2 text-white transition-colors hover:bg-black disabled:opacity-50">
            {signingOut ? "Signing out…" : "Sign Out"}
        </button>
    ) : (
        <Link href="/login" onClick={() => setMenuOpen(false)} className="inline-flex min-h-11 items-center justify-center rounded-md bg-orange-600 px-4 py-2 text-white transition-colors hover:bg-black">Login</Link>
    ));

    return (
        <header ref={headerRef} className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-blue-950 backdrop-blur-md">
            <nav aria-label="Main navigation" className="flex h-[76px] items-center justify-between gap-4 px-4 xl:h-[88px] xl:px-5">
                <Link href="/" aria-label="UGA SHPE home" onClick={() => setMenuOpen(false)} className="flex min-h-11 w-44 shrink-0 items-center xl:w-48">
                    <Image src="/images/shpe_whiteHorzi.png" alt="SHPE Logo" width={200} height={54} className="h-auto w-full" priority />
                </Link>
                <div className="hidden items-center gap-5 xl:flex">
                    {navigation.map(link => <Link key={link.href} href={link.href} aria-current={pathname === link.href ? "page" : undefined} className="flex min-h-11 items-center text-orange-500 transition-colors hover:text-white">{link.label}</Link>)}
                </div>
                <div className="hidden w-48 justify-end xl:flex">{accountAction}</div>
                <button ref={toggleRef} type="button" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} aria-controls="mobile-navigation" className="flex size-11 items-center justify-center rounded-md text-white xl:hidden">
                    {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
                </button>
            </nav>
            {signoutError && <p role="alert" className="bg-red-50 px-4 py-3 text-sm text-red-800">{signoutError}</p>}
            {menuOpen && <nav id="mobile-navigation" aria-label="Mobile navigation" className="mobile-navigation overflow-y-auto overscroll-contain border-t border-white/10 px-4 py-4 xl:hidden">
                {navigation.map(link => <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} aria-current={pathname === link.href ? "page" : undefined} className="block border-b border-white/10 py-3 text-orange-500 hover:text-white">{link.label}</Link>)}
                <div className="mt-4 flex flex-col">{accountAction}</div>
            </nav>}
        </header>
    );
}
