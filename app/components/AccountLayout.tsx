import type { ReactNode } from "react";
import NavBar from "./NavBar";
import Footer from "./Footer";

export default function AccountLayout({ title, description, children }: { title: string; description: string; children: ReactNode }) {
    return (
        <div className="site-shell">
            <NavBar />
            <main className="auth-surface">
                <div className="mx-auto mb-8 max-w-lg px-6 text-center">
                    <p className="eyebrow mb-3 text-[#b54413]">UGA SHPE · Member space</p>
                    <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
                    <p className="mt-4 text-base leading-7 text-[#5e6878]">{description}</p>
                </div>
                <div className="mx-auto max-w-xl px-5">{children}</div>
            </main>
            <Footer />
        </div>
    );
}
