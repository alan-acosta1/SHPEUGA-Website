import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { FaInstagram } from "react-icons/fa";

export default function Footer() {
    return (
        <footer className="site-footer">
            <div className="site-container grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr] md:py-16">
                <div>
                    <Link href="/" aria-label="UGA SHPE home">
                        <Image src="/images/shpe_whiteHorzi.png" alt="SHPE at the University of Georgia" width={230} height={60} className="h-auto w-56" />
                    </Link>
                    <p className="mt-5 max-w-xs text-sm leading-7 text-slate-300">
                        A community of engineers.<br />A future built together.
                    </p>
                </div>
                <div>
                    <p className="eyebrow mb-4 text-[#ff9d62]">Explore the chapter</p>
                    <div className="grid grid-cols-2 gap-3 text-sm text-slate-200">
                        <Link href="/about" className="hover:text-[#ff9d62]">About us</Link>
                        <Link href="/board" className="hover:text-[#ff9d62]">The board</Link>
                        <Link href="/event" className="hover:text-[#ff9d62]">Events</Link>
                        <Link href="/sponser" className="hover:text-[#ff9d62]">Sponsors</Link>
                    </div>
                </div>
                <div className="md:justify-self-end">
                    <p className="eyebrow mb-4 text-[#ff9d62]">Stay connected</p>
                    <a href="https://www.instagram.com/shpeuga/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 text-sm text-white hover:text-[#ff9d62]">
                        <FaInstagram size={20} /> @shpeuga <ArrowUpRight size={16} />
                    </a>
                    <p className="mt-4 text-sm text-slate-400">Athens, Georgia</p>
                </div>
            </div>
            <div className="site-container border-t border-white/15 py-6 text-xs leading-6 text-slate-400">
                © {new Date().getFullYear()} SHPE at the University of Georgia · Society of Hispanic Professional Engineers
            </div>
        </footer>
    );
}
