import NavBar from "../components/NavBar";

export default function eventPage(){
    return(
        <main className="min-h-screen w-full bg-white flex flex-col items-center">
        <NavBar></NavBar>
        <div className="w-full max-w-3xl flex flex-col items-center py-32 px-16">
            <h1 className="text-center text-3xl text-black font-bold">
                Events
            </h1>
        </div>    
       </main>
    )
}