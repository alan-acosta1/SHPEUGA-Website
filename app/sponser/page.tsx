import NavBar from "../components/NavBar"
import Footer from "../components/Footer"
import Image from "next/image"
export default function sponser(){
    return(
        <main className="min-h-screen w-full bg-white flex flex-col items-center">
            <NavBar/>
            <div className="w-full max-w-7xl flex flex-col items-center py-32 px-16">
                <h1 className="text-center text-3xl text-blue-950 font-bold">
                    Our Sponsers
                </h1>
                <p className="text-blue-950 font-bold pt-1 pb-5">
                    We are grateful for the support of our sponsors who help make our programs and opportunities possible

                </p>
    
                <Image src="/images/geVerrnova.png" alt="geVernova logo" width={600} height={600}/>
                <Image src="/images/ncrVoyix.png" alt="ncrVoyix logo" width={600} height={600}/>
                <Image src="/images/nsNorfolk.png" alt="norfolk logo" width={600} height={600}/>
            </div>
            <Footer/>

        </main>
    )
}