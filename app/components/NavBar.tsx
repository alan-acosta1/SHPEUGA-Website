"use client"
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";




export default function NavBar() {
const [user,setUser] = useState<any>(null);
const router = useRouter()
const [loading, setLoading] = useState(true);

useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({data}) => {
        setUser(data.user)
        setLoading(false)
    })

}, [])
const handleSignout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
}
 
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between py-1 px-1 bg-white backdrop-blur-md border-b border-white/10">
            <a href="/">
                <Image src="/images/shpelogo.png" alt="SHPE Logo" width={60} height={60} className="mr-2"/>
            </a>
            <div className="flex items-left gap-10">
                <Link href="/board" className="text-black hover:text-red-500 transition-colors">Board</Link>
                <Link href="/about" className="text-black hover:text-red-500 transition-colors">About</Link>
                <Link href="/event" className="text-black hover:text-red-500 transition-colors">Events</Link>
                {/*<Link href="/contact" className="text-black hover:text-red-500 transition-colors">Contact</Link>*/}
                <Link href="/resources" className="text-black hover:text-red-500 transition-colors">Need Help?</Link>
            </div>
            <div className="h-8 w-24">
                {!loading &&(
                    user ? (
                        <button className="border-solid border-white/20 bg-red-500  px-4 py-1 rounded-md hover:bg-black text-white transition-colors" 
                        onClick={handleSignout}>Sign Out</button>
                    ) : (
                        <Link href="/login"><button className="border-solid border-white/20 bg-red-500  px-4 py-1 rounded-md hover:bg-black text-white transition-colors">
                            Login</button></Link>
                    )
                )}
                
            </div>
         
        </nav>
    );
}