import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import PageIntro from "../components/PageIntro";

export default function AboutPage() {
    return (
        <div className="site-shell">
            <NavBar />
            <main>
                <PageIntro label="Our chapter" title={<>Rooted in community.<br />Built for possibility.</>} description="We’re a student-led community at the University of Georgia, bringing together different backgrounds and a shared ambition to make an impact in STEM." />
                <div className="site-container py-12 md:py-16">
                    <figure>
                        <div className="relative aspect-[4/3] overflow-hidden rounded md:aspect-[21/9]">
                            <Image src="/images/shpeGroup.jpg" alt="UGA SHPE students together at a chapter meeting" fill sizes="(max-width: 767px) 100vw, 90vw" priority className="object-cover object-[center_55%]" />
                        </div>
                        <figcaption className="mt-4 text-sm text-[#5e6878]">Different backgrounds, shared ambition. This is UGA SHPE.</figcaption>
                    </figure>
                    <section className="grid gap-8 py-16 md:grid-cols-2 md:gap-20 md:py-24">
                        <div><p className="eyebrow mb-4 text-[#b54413]">Why we’re here</p><h2 className="section-title">A place to belong.<br />A space to grow.</h2></div>
                        <div className="body-copy space-y-5">
                            <p>SHPE UGA empowers students in STEM through community, professional development, and leadership. We build connections, develop real-world skills, and prepare for careers in engineering, science, and technology.</p>
                            <p>Our mission is to encourage the study and understanding of STEM while increasing the recruitment, retention, and success of Hispanic and minority students at the University of Georgia.</p>
                        </div>
                    </section>
                    <section className="border-t border-[#e2e6ec] pt-10">
                        <p className="eyebrow mb-8 text-[#b54413]">What we build together</p>
                        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                            {[
                                ["01", "Connection", "Find peers and mentors who support you throughout your college experience."],
                                ["02", "Confidence", "Access academic and professional resources to help you take your next step."],
                                ["03", "Opportunity", "Explore career paths in STEM and connect with the people already shaping them."],
                                ["04", "Community", "Work alongside industry and community partners to make an impact together."],
                            ].map(([number, title, text]) => (
                                <article key={number}><span className="font-mono text-sm text-[#b54413]">{number}</span><h3 className="mt-5 text-2xl font-semibold tracking-tight">{title}</h3><p className="mt-3 text-base leading-7 text-[#5e6878]">{text}</p></article>
                            ))}
                        </div>
                    </section>
                    <div className="mt-14 border-t border-[#e2e6ec] pt-8"><Link href="/board" className="text-link">Meet the students leading our chapter <ArrowRight size={18} /></Link></div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
