import NavBar from "../components/NavBar"
import Footer from "../components/Footer"
export default function AboutPage(){

return(
   <main className="min-h-screen w-full bg-white flex flex-col items-center">
    <NavBar></NavBar>
    <div className="w-full max-w-3xl flex flex-col items-center py-32 px-16">
        <h1 className="text-center text-3xl text-black font-bold">
            About SHPE at UGA
        </h1>
    </div>
    <Footer/>    
   </main>
)
}