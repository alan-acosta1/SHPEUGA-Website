"use client"
import { FaInstagram } from "react-icons/fa"


export default function Footer(){
    return(
        <footer className="mt-auto">
            <a href ="https://www.instagram.com/shpeuga/" target="blank" rel="noopener noreferrer">
                <FaInstagram 
                className="text-orange-700 text-5xl hover:text-blue-700 cursor-pointer transition-colors"
                />
            </a>

        </footer>
    )
}