import type { ReactNode } from "react";

export default function PageIntro({ label, title, description }: { label: string; title: ReactNode; description: string }) {
    return (
        <header className="page-intro">
            <div className="site-container grid gap-6 md:grid-cols-[1.1fr_1fr] md:items-end">
                <div>
                    <p className="eyebrow mb-4 text-[#b54413]">{label}</p>
                    <h1 className="section-title">{title}</h1>
                </div>
                <p className="body-copy md:justify-self-end">{description}</p>
            </div>
        </header>
    );
}
