import { CalendarDays, Clock3 } from "lucide-react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import PageIntro from "../components/PageIntro";

export default function EventPage() {
    return (
        <div className="site-shell">
            <NavBar />
            <main>
                <PageIntro label="Come through" title={<>Make room for<br />what’s next.</>} description="From professional workshops to time with the familia, find your next opportunity to connect with UGA SHPE." />
                <section className="site-container py-10 md:py-14">
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                        <h2 className="flex items-center gap-3 text-xl font-semibold tracking-tight"><CalendarDays size={22} className="text-[#b54413]" /> Chapter calendar</h2>
                        <p className="flex items-center gap-2 text-sm text-[#5e6878]"><Clock3 size={16} /> Eastern Time · Athens, GA</p>
                    </div>
                    <div className="overflow-hidden rounded-lg border border-[#e2e6ec] bg-[#f3f5f8] p-2 md:p-4">
                        <iframe title="UGA SHPE chapter events calendar" src="https://calendar.google.com/calendar/embed?src=7b226ceb99d2b8be29de0d391fcc8ff27b2e30b6b4a2bcb80467bb0b1c533882%40group.calendar.google.com&ctz=America%2FNew_York" className="h-[560px] w-full border-0 md:h-[650px]" />
                    </div>
                    <p className="mt-5 text-sm leading-6 text-[#5e6878]">For chapter updates and event highlights, follow <a href="https://www.instagram.com/shpeuga/" target="_blank" rel="noopener noreferrer" className="font-medium text-[#b54413] underline underline-offset-4">@shpeuga on Instagram</a>.</p>
                </section>
            </main>
            <Footer />
        </div>
    );
}
