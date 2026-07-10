import NavBar from "../components/NavBar"
import Footer from "../components/Footer"
export default function AboutPage(){

return(
   <main className="min-h-screen w-full bg-white flex flex-col items-center">
    <NavBar></NavBar>
    <div className="relative w-full h-110 flex items-start justify-center mt-15 pt-8" style={{backgroundImage: "url('/images/shpeGroup.jpg')",backgroundSize:'cover', backgroundPosition:'center'}}>
        <div className="absolute inset-0 bg-black/30"/>
        <h1 className="relative z-10 text-center text-5xl text-white font-bold">
            About SHPE UGA
        </h1>
    </div>
    <div className="w-full max-w-3xl flex flex-col items-center pt-8 pb-32 px-16">
       
        <h2 className="text-center text-3xl text-orange-600 font-bold">Who we are</h2>
        <p className="text-blue-950">SHPE UGA is a student-led organization at the University of Georgia focused on empowering students in stem through community,professional development, and leadership</p>
        <p className="text-blue-950">We bring together students from diverse backgrounds to build connections, develop real-world skills, and prepare for careers in engineering,science, and technology</p>
        <h2 className="text-center text-3xl text-orange-600 font-bold">Our Mission</h2>
        <p className="text-blue-950">Our mission is to promote and encourage the study and understanding of STEM fields while increasing the recruitment,retention, and success of Hispanic and minority students at the University of Georiga</p>
        <div className="flex flex-col pt-5 self-start">
            <p className="text-blue-950">We provide a platform for students to:</p>
            <ul className="list-disc list-inside space-y-2 text-blue-950 ">
                <li>Connect with peers and mentors</li>
                <li>Access academic and professional resources</li>
                <li>Explore career opportunities in STEM</li>
                <li>Engage with industry and community partners</li>
            </ul>
        </div>
    </div>
    <Footer/>    
   </main>
)
}