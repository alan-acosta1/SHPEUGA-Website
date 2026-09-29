"use client"
import { FaInstagram } from "react-icons/fa"


export default function Footer(){
    return(
        <footer className="mt-auto flex flex-col items-center gap-3 px-4 py-4 text-center">
            <a href ="https://www.instagram.com/shpeuga/" target="_blank" aria-label="UGA SHPE on Instagram" rel="noopener noreferrer">
                <FaInstagram 
                className="text-orange-700 text-5xl hover:text-blue-700 cursor-pointer transition-colors"
                />
            </a>
            <p className="text-xs text-slate-600">
                © {new Date().getFullYear()} UGA SHPE. All rights reserved.
            </p>
        </footer>
    )
}
