import { ArrowUpRight } from "lucide-react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import PageIntro from "../components/PageIntro";

export default function ResourcesPage() {
    return (
        <div className="site-shell">
            <NavBar />
            <main>
                <PageIntro label="SHPEBytes resources" title={<>Keep learning.<br />Keep building.</>} description="Working on the chapter website? Start with the documentation for the tools behind it." />
                <div className="site-container grid gap-6 py-12 md:grid-cols-2 md:py-16">
                    {[
                        ["Tailwind CSS", "Explore utility classes, styling, and responsive layouts.", "https://tailwindcss.com/docs/installation/using-vite"],
                        ["Next.js", "Learn about components, routing, and the application framework.", "https://nextjs.org/docs/app/getting-started"],
                    ].map(([title, description, href]) => (
                        <a key={title} href={href} target="_blank" rel="noopener noreferrer" className="group rounded border border-[#e2e6ec] p-8 transition-colors hover:bg-[#f3f5f8]">
                            <div className="flex items-center justify-between gap-4"><h2 className="text-2xl font-semibold tracking-tight">{title}</h2><ArrowUpRight size={22} className="text-[#b54413]" /></div>
                            <p className="body-copy mt-4">{description}</p>
                        </a>
                    ))}
                </div>
            </main>
            <Footer />
        </div>
    );
}
