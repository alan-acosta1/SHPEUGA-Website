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
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 ">
                <div className="bg-white rounded-lg p-8 w-2/3 h-1/2  shadow-xl flex relative">
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 transition-colors z-10">
                        <X size={24}/>
                    </button>
                    <div className="w-1/3 shrink-0">
                        <Image 
                            src={photoUrl || "/images/shpelogo.png"} 
                            alt={name} 
                            width={300} 
                            height={400} 
                            className="object-cover rounded-full mx-auto"
                        />
                    </div>
                    <div className="flex-1 p-8 flex flex-col">
                            <p className="text-gray-600 ">Bio: {bio}</p>
                    </div>
                    
                </div>
            </div>
            )}
            </>
)
}