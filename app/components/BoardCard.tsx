"use client";

import Image from "next/image";
import { useId, useRef } from "react";
import { ArrowUpRight, X } from "lucide-react";

type BoardCardProps = {
    name: string;
    position: string;
    photoUrl: string;
    bio: string;
};

export default function ExecCard({ name, position, photoUrl, bio }: BoardCardProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const titleId = useId();

    return (
        <>
            <button type="button" className="board-card group" onClick={() => dialogRef.current?.showModal()} aria-label={"Meet " + name + ", " + position} aria-haspopup="dialog">
                <div className="board-card-photo">
                    <Image src={photoUrl || "/images/shpelogo.png"} alt={name} fill sizes="(max-width: 380px) 100vw, (max-width: 767px) 50vw, (max-width: 1100px) 33vw, 25vw" className="object-cover" />
                    <span className="board-card-open" aria-hidden="true"><ArrowUpRight size={18} /></span>
                </div>
                <div className="pt-5">
                    <h3 className="text-lg font-semibold tracking-tight transition-colors group-hover:text-[#b54413] md:text-xl">{name}</h3>
                    <p className="mt-1 text-sm leading-6 text-[#5e6878]">{position}</p>
                </div>
            </button>
            <dialog ref={dialogRef} aria-labelledby={titleId} className="board-dialog">
                <div className="board-dialog-layout">
                    <button type="button" onClick={() => dialogRef.current?.close()} aria-label="Close board member popup" className="absolute right-3 top-3 z-10 rounded-full bg-white p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900">
                        <X size={20} />
                    </button>
                    <div className="board-dialog-photo">
                        <Image src={photoUrl || "/images/shpelogo.png"} alt={name} fill sizes="(max-width: 767px) 180px, 22vw" className="object-cover" />
                    </div>
                    <div className="board-dialog-copy">
                        <p className="eyebrow text-slate-500">UGA SHPE · Executive Board</p>
                        <h2 id={titleId} className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-slate-900 lg:text-4xl">{name}</h2>
                        <p className="mt-2 text-base font-medium text-orange-700">{position}</p>
                        {bio.trim() && (
                            <>
                                <div className="my-5 h-1 w-10 shrink-0 rounded-full bg-orange-500" />
                                <p className="whitespace-pre-line break-words text-base leading-relaxed text-slate-600">{bio}</p>
                            </>
                        )}
                    </div>
                </div>
            </dialog>
        </>
    );
}
