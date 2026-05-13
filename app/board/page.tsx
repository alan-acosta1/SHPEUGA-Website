import NavBar from "../components/NavBar";
import ExecCard from "../components/BoardCard";
import { createClient } from "@/utils/supabase/server";
export const revalidate = 3600
export default async function boardPage(){

    const supabase = await createClient();
    const {data,error} = await supabase.from('execBoard').select(`*,members(first_name, last_name)`);
    if(error){
        console.error('Can not load infomation',error);
        return <div>Failed to load board member</div>
    }

    return(
        <main className="min-h-screen w-full bg-white flex flex-col items-center">
            <NavBar></NavBar>
            <div className="w-full max-w-3xl flex flex-col items-center py-32 px-16">
                <h1 className="text-center text-3xl text-black font-bold">
                    The faces of UGA SHPE
                 </h1>
                 <div className="grid grid-cols-4 gap-6">
                    {data.map((member) =>(
                        <ExecCard
                            key = {member.id}
                            name ={`${member.members.first_name} ${member.members.last_name}`}
                            position = {member.title}
                            photoUrl= {member.photo_url}
                            bio = {member.bio}
                        />




                    ))}
                 </div>



            </div>    
           </main>
    )
}