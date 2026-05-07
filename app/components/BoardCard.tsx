"use client"

import Image from "next/image"
import { useState } from "react"
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
                className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow w-64"
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
                <span className="inline-block mt-2 bg-red-600 text-white text-sm font-semibold px-4 py-1 rounded-full">
                    {position}
                </span>
                </div>
            </div>
            {isOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 max-w-sm w-full shadow-xl">
                <Image 
                    src={photoUrl || "/images/shpelogo.png"} 
                    alt={name} 
                    width={100} 
                    height={100} 
                    className="object-cover rounded-full mx-auto"
                />
                <h2 className="text-xl font-bold text-center mt-4">{name}</h2>
                <p className="text-center text-red-600 font-semibold mt-1">{position}</p>
                <p className="text-gray-600 text-center mt-4">{bio}</p>
                <button 
                    onClick={() => setIsOpen(false)}
                    className="mt-6 w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition-colors"
                >
                Close
                </button>
            </div>
            </div>
            )}
            </>
)
}