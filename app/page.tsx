import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";

const experiences = [
    { number: "01", title: "Find your next opportunity.", label: "Industry engagement", photo: "/images/shpeIndustry.JPG", alt: "UGA SHPE members connecting with industry professionals", description: "Meet recruiters and engineers through company information sessions and conversations that open doors." },
    { number: "02", title: "Take your ambition further.", label: "Conferences & leadership", photo: "/images/shpeConf.jpg", alt: "UGA SHPE members at a SHPE conference", description: "Build connections and leadership experience at SHPE National Convention and regional events." },
    { number: "03", title: "Be ready for what’s next.", label: "Career development", photo: "/images/shpeCareer.jpg", alt: "SHPE members at a career development event", description: "From your first résumé to your next career fair, prepare with workshops, portfolio building, and support from your peers." },
    { number: "04", title: "Find your people.", label: "Community & events", photo: "/images/shpeCommunity.jpg", alt: "Students coming together at a UGA SHPE community event", description: "General body meetings, study sessions, and social events make a big campus feel a little more like home." },
];

export default function Home() {
    return (
        <div className="site-shell">
            <NavBar />
            <main>
                <section className="home-hero">
                    <div className="site-container hero-layout">
                        <div>
                            <p className="eyebrow mb-7 text-[#ff9d62]">University of Georgia · SHPE</p>
                            <h1 className="display-title">Engineering<br />futures.<br /><span className="text-[#ff9d62]">Building<br className="hidden xl:block" /> familia.</span></h1>
                            <p className="mt-7 max-w-md text-base leading-7 text-slate-300">
                                Your ambition belongs here. Find community, build your skills, and take the next step with UGA’s Society of Hispanic Professional Engineers.
                            </p>
                            <div className="mt-8 flex flex-wrap gap-3">
                                <Link href="/signup" className="button-primary">Join the familia <ArrowRight size={17} /></Link>
                                <Link href="/about" className="button-secondary">Meet our chapter</Link>
                            </div>
                        </div>
                        <figure className="hero-photo">
                            <Image src="/images/shpe_test.jpeg" alt="UGA SHPE members together in Philadelphia" fill sizes="(max-width: 767px) 100vw, 50vw" priority className="object-cover" />
                            <figcaption className="hero-caption">
                                <span className="eyebrow text-[#ffb88e]">Beyond the classroom</span>
                                <p className="mt-2 text-lg font-medium tracking-tight">Different paths. One familia.</p>
                            </figcaption>
                        </figure>
                    </div>
                </section>
                <section aria-label="Our impact" className="border-b border-[#e2e6ec] bg-white">
                    <div className="site-container impact-grid">
                        <div><p className="eyebrow text-[#b54413]">Our impact</p><p className="mt-2 text-lg font-medium tracking-tight">Small chapter.<br className="hidden md:block" /> Big possibilities.</p></div>
                        <div className="impact-stat"><strong>160<span className="text-[#c8531e]">+</span></strong><p>Students engaged</p></div>
                        <div className="impact-stat"><strong>25<span className="text-[#c8531e]">+</span></strong><p>Professional & social events</p></div>
                        <div className="impact-stat"><strong>6<span className="text-[#c8531e]">+</span></strong><p>Industry partners</p></div>
                    </div>
                </section>
                <section className="site-container py-16 md:py-24">
                    <div className="mb-10 grid gap-6 md:mb-14 md:grid-cols-2 md:items-end">
                        <div><p className="eyebrow mb-4 text-[#b54413]">The SHPE experience</p><h2 className="section-title">More than<br />a degree.</h2></div>
                        <p className="body-copy max-w-md md:justify-self-end">The connections you make here go beyond the classroom. Discover what’s possible with a community in your corner.</p>
                    </div>
                    <div className="experience-grid">
                        {experiences.map((experience) => (
                            <article key={experience.number} className="experience-item">
                                <div className="experience-photo"><Image src={experience.photo} alt={experience.alt} fill sizes="(max-width: 767px) 100vw, 50vw" className="object-cover" /></div>
                                <div className="mt-6 flex items-center gap-3"><span className="font-mono text-xs text-[#b54413]">{experience.number}</span><p className="eyebrow text-[#5e6878]">{experience.label}</p></div>
                                <h3 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">{experience.title}</h3>
                                <p className="body-copy mt-3 max-w-lg">{experience.description}</p>
                            </article>
                        ))}
                    </div>
                </section>
                <section className="border-t border-[#e2e6ec] bg-[#f3f5f8]">
                    <div className="site-container flex flex-col items-start justify-between gap-6 py-12 md:flex-row md:items-center">
                        <div><p className="eyebrow mb-3 text-[#b54413]">Your next connection starts here</p><h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Come be part of it.</h2></div>
                        <Link href="/event" className="button-primary">Explore chapter events <ArrowRight size={18} /></Link>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
