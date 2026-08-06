import NavBar from "../components/NavBar";
import Profile from "../components/Profile";

export default function ProfilePage(){
    return(
        <main className="min-h-screen w-full bg-white flex flex-col items-center">
        <NavBar></NavBar>
        <div className="pt-28">
            <h1 className="text-blue-950 text-3xl font-bold text-center mt-8 mb-4">
                My Profile
            </h1>
        </div>
            <Profile></Profile>

       </main>
    )
}
