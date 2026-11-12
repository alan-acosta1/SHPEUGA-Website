import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, CalendarDays, MapPin } from "lucide-react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import ConferenceGallery from "./ConferenceGallery";
import { conferencePhotos } from "./photos";

export const metadata: Metadata = {
    title: "National Conference | UGA SHPE",
    description: "Discover SHPE National Convention, from career opportunities and professional development to community. Explore UGA SHPE’s 2026 convention photo recap.",
};

const conventionUrl = "https://shpe.org/engage/events/national-convention/";

export default function ConferencePage() {
    return (
        <div className="flex min-h-screen flex-col bg-[#faf9f6] text-blue-950">
            <NavBar />
            <main className="mt-[76px] flex-1 xl:mt-[88px]">
                <header className="relative isolate flex min-h-80 items-center justify-center overflow-hidden px-5 py-14 text-center sm:min-h-110 sm:py-20">
                    <Image src="/images/shpeConf.jpg" alt="UGA SHPE members together at a SHPE conference" fill sizes="100vw" priority className="-z-20 object-cover object-[center_40%]" />
                    <div className="absolute inset-0 -z-10 bg-blue-950/75" />
                    <div className="max-w-3xl">
                        <p className="mb-4 text-sm font-bold uppercase tracking-widest text-orange-300">UGA SHPE · National Convention</p>
                        <h1 className="text-3xl font-bold text-white sm:text-5xl">SHPE National Conference</h1>
                        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white sm:text-lg sm:leading-8">The SHPE National Convention is an annual gathering of STEM students and professionals from across the country. From the career fair and workshops to networking with your national familia, it’s a place to explore opportunities and build your future.</p>
                        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                            <a href={conventionUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-orange-700 px-5 py-3 font-semibold text-white transition-colors hover:bg-orange-800">Official convention details <ArrowUpRight size={18} aria-hidden="true" /></a>
                            <a href="#convention-album" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/60 px-5 py-3 font-semibold text-white transition-colors hover:bg-white/10">See our 2026 recap <ArrowDown size={18} aria-hidden="true" /></a>
                        </div>
                    </div>
                </header>

                <section aria-labelledby="experience-title" className="border-y border-slate-200 bg-white">
                    <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-[0.9fr_1.1fr] md:gap-20 md:py-16">
                        <div>
                            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-orange-800">More than a conference</p>
                            <h2 id="experience-title" className="text-3xl font-bold tracking-tight sm:text-4xl">Opportunity.<br />Connection.<br /><span className="text-orange-700">Community.</span></h2>
                            <a href={conventionUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-orange-800 underline underline-offset-4">About SHPE National Convention <ArrowUpRight size={17} aria-hidden="true" /></a>
                        </div>
                        <div className="divide-y divide-slate-200">
                            {[
                                ["01", "A world of possibilities", "The national career fair brings students and employers together to explore careers in STEM."],
                                ["02", "Room to grow", "Workshops and conversations with professionals offer new perspectives beyond the classroom."],
                                ["03", "Familia, wherever we go", "Convention connects SHPE members across chapters and gives our UGA familia time together beyond campus."],
                            ].map(([number, title, description]) => (
                                <article key={number} className="flex gap-5 py-6 first:pt-0 last:pb-0">
                                    <span className="pt-1 font-mono text-sm text-orange-800" aria-hidden="true">{number}</span>
                                    <div><h3 className="text-xl font-bold">{title}</h3><p className="mt-2 leading-7 text-slate-600">{description}</p></div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="convention-album" aria-labelledby="album-title" className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 md:py-16">
                    <div className="mb-8 flex flex-col justify-between gap-5 md:mb-10 md:flex-row md:items-end">
                        <div>
                            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-orange-800">2026 convention recap · Through our lens</p>
                            <h2 id="album-title" className="text-3xl font-bold tracking-tight sm:text-4xl">The moments we bring home.</h2>
                        </div>
                        <div className="max-w-sm text-sm leading-6 text-slate-600">
                            <p className="mb-2 flex flex-wrap gap-x-4 gap-y-2 font-semibold text-blue-950">
                                <span className="inline-flex items-center gap-2"><MapPin size={16} aria-hidden="true" /> Indianapolis, IN</span>
                                <span className="inline-flex items-center gap-2"><CalendarDays size={16} aria-hidden="true" /><span><time dateTime="2026-10-28">Oct. 28</time>–<time dateTime="2026-10-31">31, 2026</time></span></span>
                            </p>
                            <p>From getting suited up to spending time together after hours. This is our convention album.</p>
                        </div>
                    </div>
                    <ConferenceGallery photos={conferencePhotos} />
                    <p className="mt-6 text-sm text-slate-600">Select a photo to take a closer look.</p>
                </section>

                <section aria-labelledby="next-title" className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 md:py-16">
                    <div className="flex flex-col justify-between gap-8 rounded-2xl bg-blue-950 p-6 text-white sm:p-10 md:flex-row md:items-center">
                        <div>
                            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-orange-300">Next stop · Houston, Texas</p>
                            <h2 id="next-title" className="text-2xl font-bold sm:text-3xl">Be part of the next chapter.</h2>
                            <p className="mt-3 text-sm leading-7 text-slate-200">October 6–9, 2027. Connect with the board about attending with UGA SHPE.</p>
                        </div>
                        <Link href="/board" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-3 self-start rounded-md bg-orange-700 px-5 py-3 font-semibold text-white transition-colors hover:bg-orange-800">Meet the board <ArrowRight size={18} aria-hidden="true" /></Link>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
