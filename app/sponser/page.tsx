import Image from "next/image";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import PageIntro from "../components/PageIntro";

const sponsors = [
    { name: "GE Vernova", image: "/images/geVerrnova.png", width: 1280, height: 283 },
    { name: "NCR Voyix", image: "/images/ncrVoyix.png", width: 1200, height: 630 },
    { name: "Norfolk Southern", image: "/images/nsNorfolk.png", width: 3000, height: 1200 },
];

export default function SponsorPage() {
    return (
        <div className="site-shell">
            <NavBar />
            <main>
                <PageIntro label="Our sponsors" title={<>Investing in<br />the next generation.</>} description="Our sponsors help turn ambition into opportunity. Their support makes our chapter’s programs, professional connections, and experiences possible." />
                <section aria-label="Chapter sponsors" className="site-container py-12 md:py-20">
                    <div className="grid gap-6 md:grid-cols-3">
                        {sponsors.map((sponsor) => (
                            <article key={sponsor.name} className="flex flex-col overflow-hidden rounded border border-[#e2e6ec]">
                                <div className="flex h-56 items-center justify-center bg-white p-10">
                                    <Image src={sponsor.image} alt={sponsor.name + " logo"} width={sponsor.width} height={sponsor.height} className="max-h-36 w-full object-contain" />
                                </div>
                                <h2 className="border-t border-[#e2e6ec] bg-[#f3f5f8] px-6 py-5 text-center text-base font-medium">{sponsor.name}</h2>
                            </article>
                        ))}
                    </div>
                    <div className="mx-auto max-w-2xl py-14 text-center md:py-20">
                        <p className="eyebrow mb-4 text-[#b54413]">A shared commitment</p>
                        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Thank you for believing<br />in our students.</h2>
                        <p className="body-copy mt-5">Together, we’re building a stronger connection between the classroom, our community, and the future of engineering.</p>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
