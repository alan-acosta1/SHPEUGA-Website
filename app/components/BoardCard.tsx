"use client"

import Image from "next/image"
import { useState } from "react"
import {X} from 'lucide-react'
type BoardingCardProps = {
    name: string
    position: string
    photoUrl: string
    bio: string
}

export default function ExecCard({name,position,photoUrl,bio}:BoardingCardProps){
    const [isOpen, setIsOpen] = useState(false)
    return(
        <>
            <div 
                onClick={() => setIsOpen(true)}
                className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow "
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
            </div>
            {isOpen && (
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-8 w-2/3 h-1/2 shadow-2xl ring-1 ring-black/5 flex relative font-sans">
                    <button 
                        onClick={() => setIsOpen(false)}
                        aria-label="Close board member popup"
                        className="absolute top-3 right-3 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-orange-600 transition-colors z-10">
                        <X size={20}/>
                    </button>
                    <div className="relative w-1/3 h-full min-h-0 shrink-0 overflow-hidden rounded-full">
                        <Image 
                            src={photoUrl || "/images/shpelogo.png"} 
                            alt={name} 
                            fill
                            sizes="22vw"
                            className="object-cover"
                        />
                    </div>
                    <div className="min-w-0 flex-1 px-8 lg:px-10 py-4 flex flex-col overflow-y-auto">
                        <p className="text-[10px] lg:text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                            UGA SHPE · Executive Board
                        </p>
                        <h2 className="mt-3 text-2xl lg:text-4xl font-semibold tracking-tight leading-tight text-slate-900 break-words">
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
            </div>
            )}
            </>
)
}
