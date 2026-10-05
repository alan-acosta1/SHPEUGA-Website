import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import NavBar from "../components/NavBar";
import Profile from "../components/Profile";

export default async function ProfilePage(){
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");
    return(
        <main className="min-h-screen w-full bg-white flex flex-col items-center">
        <NavBar></NavBar>
        <div className="px-4 pt-20 sm:pt-28">
            <h1 className="text-blue-950 text-3xl font-bold text-center mt-8 mb-4">
                My Profile
            </h1>
        </div>
            <Profile></Profile>

       </main>
    )
}
