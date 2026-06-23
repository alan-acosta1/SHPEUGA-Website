import NavBar from "../components/NavBar";
import ExecCard from "../components/BoardCard";
import { createClient } from "@/utils/supabase/server";
import Footer from "../components/Footer";
export const revalidate = 0
export default async function boardPage(){

    const supabase = await createClient();
    const {data,error} = await supabase.from('execBoard').select(`*`);
    if(error){
        console.error('Can not load infomation',error);
        return <div>Failed to load board member</div>
    }

    return(
        <main className="min-h-screen w-full bg-white flex flex-col items-center">
            <NavBar></NavBar>
            <div className="w-full max-w-7xl flex flex-col items-center py-32 px-16">
                <h1 className="text-center text-3xl text-black font-bold">
                    UGA SHPE Executive Board
                 </h1>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
                    {data.map((member) =>(
                        <ExecCard
                            key = {member.id}
                            name ={member.name}
                            position = {member.title}
                            photoUrl= {member.photo_url}
                            bio = {member.bio}
                        />




                    ))}
                 </div>



            </div>   
            <Footer/> 
           </main>
    )
}