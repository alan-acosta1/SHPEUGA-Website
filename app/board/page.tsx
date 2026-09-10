import NavBar from "../components/NavBar";
import ExecCard from "../components/BoardCard";
import Footer from "../components/Footer";
import PageIntro from "../components/PageIntro";
import { boardMembers } from "./members";

export default function BoardPage() {
    return (
        <div className="site-shell">
            <NavBar />
            <main>
                <PageIntro label="Meet the executive board" title={<>Your peers.<br />Your biggest supporters.</>} description="The students bringing our chapter to life. Get to know the people behind the events, connections, and community at UGA SHPE." />
                <section aria-label="Executive board members" className="site-container py-12 md:py-16">
                    <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-[#e2e6ec] pb-5">
                        <h2 className="text-lg font-semibold tracking-tight">Chapter leadership</h2>
                        <p className="text-sm text-[#5e6878]">{boardMembers.length} leaders · One familia</p>
                    </div>
                    <div className="board-grid">
                        {boardMembers.map((member) => <ExecCard key={member.name} {...member} />)}
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
