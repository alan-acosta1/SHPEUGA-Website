"use client"
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";



export default function NavBar() {
const [user,setUser] = useState<any>(null);
const router = useRouter();
const [loading, setLoading] = useState(true);
//const [role, setRole] = useState<string | null>(null)
const {role} = useAuth();
useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({data}) =>{
        setUser(data.user)
        setLoading(false)
    })
},[])




const handleSignout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    //setRole(null)
    router.push('/')
}
 
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between py-5 px-1 bg-blue-950 backdrop-blur-md border-b border-white/10">
            <Link href="/" className="w-48 shrink-0">
                <Image src="/images/shpe_whiteHorzi.png" alt="SHPE Logo" width={200} height={200} className="mr-2"/>
            </Link>
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-10">
                <Link href="/board" className="text-orange-500 hover:text-white transition-colors">Board</Link>
                <Link href="/about" className="text-orange-500 hover:text-white transition-colors">About</Link>
                <Link href="/event" className="text-orange-500 hover:text-white transition-colors">Events</Link>
                <Link href="/sponser" className="text-orange-500 hover:text-white transition-colors">Sponsers</Link>
                {/*<Link href="/contact" className="text-black hover:text-red-500 transition-colors">Contact</Link>*/}
                {/*<Link href="/resources" className="text-black hover:text-white transition-colors">Need Help?</Link>*/}
                {user &&(
                    <Link href="/profile" className="text-orange-500 hover:text-white transition-colors">Profile</Link>
                )}
                {role === 'exec' &&(
                    <Link href="/admin" className="text-black hover:text-white transition-colors">Admin page</Link>
                )}
            </div>
            <div className="w-48 flex justify-end shrink-0">
                {!loading &&(
                    user ? (
                        <button className="border-solid border-white/20 bg-orange-600  px-4 py-1 rounded-md hover:bg-black text-white transition-colors" 
                        onClick={handleSignout}>Sign Out</button>
                    ) : (
                        <Link href="/login"><button className="border-solid border-white/20 bg-orange-600  px-4 py-1 rounded-md hover:bg-black text-white transition-colors">
                            Login</button></Link>
                    )
                )}
                
            </div>
         
        </nav>
    );
}