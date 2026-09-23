"use client"

import Image from "next/image"
import { useId, useRef } from "react"
import {X} from 'lucide-react'
type BoardingCardProps = {
    name: string
    position: string
    photoUrl: string
    bio: string
}

export default function ExecCard({name,position,photoUrl,bio}:BoardingCardProps){
    const dialogRef = useRef<HTMLDialogElement>(null)
    const titleId = useId()
    return(
        <>
            <button type="button" aria-haspopup="dialog" aria-label={`Meet ${name}, ${position}`}
                onClick={() => dialogRef.current?.showModal()}
                className="w-full text-left bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow "
            >
                <Image 
                src={photoUrl || "/images/shpelogo.png" } 
                alt={name} 
                width={300} 
                height={400} 
                className="object-cover w-full h-72"
                />
                <div className="p-4 text-center">
                <p className="font-bold text-gray-900 text-lg">{name}</p>
                <span className="inline-block mt-2 bg-orange-600 text-white text-sm font-semibold px-4 py-1 rounded-full">
                    {position}
                </span>
                </div>
            </button>
            <dialog ref={dialogRef} aria-labelledby={titleId} className="board-dialog bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 font-sans">
                <div className="board-dialog-layout flex relative p-6 md:p-8">
                    <button 
                        type="button" onClick={() => dialogRef.current?.close()}
                        aria-label="Close board member popup"
                        className="absolute top-3 right-3 flex size-11 items-center justify-center rounded-full bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-orange-600 transition-colors z-10">
                        <X size={20}/>
                    </button>
                    <div className="board-dialog-photo relative shrink-0 overflow-hidden rounded-full">
                        <Image 
                            src={photoUrl || "/images/shpelogo.png"} 
                            alt={name} 
                            fill
                            sizes="(max-width: 1023px) 160px, 22vw"
                            className="object-cover"
                        />
                    </div>
                    <div className="board-dialog-copy min-w-0 flex-1 flex flex-col">
                        <p className="text-[10px] lg:text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                            UGA SHPE · Executive Board
                        </p>
                        <h2 id={titleId} className="mt-3 text-2xl lg:text-4xl font-semibold tracking-tight leading-tight text-slate-900 break-words">
                            {name}
                        </h2>
                        <p className="mt-2 text-sm lg:text-base font-medium text-orange-700">
                            {position}
                        </p>
                        {bio.trim() && (
                            <>
                                <div className="my-5 h-1 w-10 shrink-0 rounded-full bg-orange-500" />
                                <p className="text-sm lg:text-base leading-relaxed text-slate-600 whitespace-pre-line break-words">
                                    {bio}
                                </p>
                            </>
                        )}
                    </div>
                    
                </div>
            </dialog>
            </>
)
}
