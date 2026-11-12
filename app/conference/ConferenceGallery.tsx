"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight, Expand, X } from "lucide-react";
import { useRef, useState } from "react";
import type { ConferencePhoto } from "./photos";

export default function ConferenceGallery({ photos }: { photos: ConferencePhoto[] }) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [selected, setSelected] = useState(0);
    const photo = photos[selected];

    function move(direction: number) {
        setSelected(current => (current + direction + photos.length) % photos.length);
    }

    if (!photos.length) return null;

    return (
        <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {photos.map((item, index) => (
                    <button key={item.src} type="button" aria-label={`Open photo ${index + 1}: ${item.caption}`} onClick={() => { setSelected(index); dialogRef.current?.showModal(); }} className={`group flex min-w-0 flex-col rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition-shadow hover:shadow-lg sm:p-4 ${index === 1 ? "sm:col-start-1 sm:row-start-2" : index === 2 ? "sm:col-start-2 sm:row-start-1" : ""}`}>
                        <div className={`relative w-full shrink-0 overflow-hidden rounded-lg bg-slate-100 ${item.height > item.width ? "sm:aspect-[3/4]" : "sm:aspect-[4/3]"}`}>
                            <Image src={item.src} alt={item.alt} width={item.width} height={item.height} sizes="(max-width: 639px) 100vw, 50vw" priority={index === 0} className="h-auto w-full transition-transform duration-300 group-hover:scale-[1.03] sm:absolute sm:inset-0 sm:h-full sm:object-cover" />
                            <span className="absolute bottom-3 right-3 flex size-10 items-center justify-center rounded-full bg-white/95 text-blue-950 shadow-sm"><Expand size={17} aria-hidden="true" /></span>
                        </div>
                        <div className="flex w-full flex-1 flex-col px-1 pb-2 pt-5">
                            <p className="text-xs font-semibold uppercase tracking-wider text-orange-800">{item.location}</p>
                            <h3 className="mt-2 text-xl font-bold leading-snug text-blue-950">{item.caption}</h3>
                        </div>
                    </button>
                ))}
            </div>

            <dialog ref={dialogRef} aria-labelledby="conference-photo-caption" className="conference-gallery-dialog fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-5xl overflow-y-auto overscroll-contain rounded-xl border-0 bg-white p-0 text-blue-950 shadow-2xl backdrop:bg-slate-950/85" onKeyDown={event => {
                if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                    event.preventDefault();
                    move(event.key === "ArrowRight" ? 1 : -1);
                }
            }}>
                <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-4 py-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">UGA SHPE · Convention album</p>
                    <button type="button" aria-label="Close photo viewer" onClick={() => dialogRef.current?.close()} className="flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-slate-100"><X size={22} aria-hidden="true" /></button>
                </div>
                <div className="relative h-[50dvh] min-h-48 bg-slate-950 sm:h-[60dvh]">
                    <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 1023px) 100vw, 1024px" className="object-contain" />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-6">
                    <div aria-live="polite" aria-atomic="true">
                        <h3 id="conference-photo-caption" className="text-lg font-bold">{photo.caption}</h3>
                        <p className="mt-1 text-sm text-slate-600">{photo.location} · Photo {selected + 1} of {photos.length}</p>
                    </div>
                    {photos.length > 1 && <div className="flex gap-2">
                        <button type="button" aria-label="Previous photo" onClick={() => move(-1)} className="flex size-11 items-center justify-center rounded-full border border-slate-300 hover:bg-orange-50"><ArrowLeft size={20} aria-hidden="true" /></button>
                        <button type="button" aria-label="Next photo" onClick={() => move(1)} className="flex size-11 items-center justify-center rounded-full border border-slate-300 hover:bg-orange-50"><ArrowRight size={20} aria-hidden="true" /></button>
                    </div>}
                </div>
            </dialog>
        </>
    );
}
