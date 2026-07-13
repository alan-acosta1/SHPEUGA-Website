import Image from "next/image";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import Link from "next/link";
import Carousel from "./components/ImageSlide";
import { FaCalendarAlt } from "react-icons/fa";
import { FaUser } from "react-icons/fa";
import {FaHandshakeSimple} from "react-icons/fa6";

export default function Home() {
  return (
    <div className="flex flex-col  min-h-screen bg-zinc-50 font-sans ">
        <NavBar/>
       
        {/*top of front page*/}
        <main className="flex-1 w-full ">
          {/*<Carousel/>*/}
          <div className="flex flex-col items-center justify-center pt-40 pb-20">
            <Image src="/images/shpe_horzi.png" alt="horzontal shpe logo" width={600} height={600}/>
          </div>

          <div className="flex flex-col items-center">
            <h1 className=" text-blue-950 font-bold pb-5">
              Empowering the next generation of engineers
            </h1>
            <Link href="/login">
              <button 
              className="border-solid border-white/20 bg-orange-700  px-4 py-1 rounded-md hover:bg-black text-white transition-colors">Join SHPE UGA
              </button>
            </Link>  

            {/* Our impact section */}
            <h1 className="text-orange-600 font-bold pt-10 text-5xl">
              Our Impact
            </h1>
            <p className="text-blue-950 font-bold pb-5">Connecting students with opportunities, community, and industry at UGA </p>
            <div className="flex gap-6 justify-center pb-10">
              <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center justify-center w-72 h-80">
                <FaUser className="text-blue-900 w-24 h-24"/>
                <p className="text-6xl font-bold text-orange-600 mt-2">160+</p>
                <p className="text-xl font-bold text-gray-800 text-center mt-3">Students Engaged</p>
              </div>

              <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center justify-center w-72 h-80">
                <FaCalendarAlt className="text-blue-900 w-24 h-24"/>
                <p className="text-6xl font-bold text-orange-600 mt-2">25+</p>
                <p className="text-xl font-bold text-gray-800 text-center mt-3">Professional & Social Events</p>
              </div>
              <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center justify-center w-72 h-80">
                <FaHandshakeSimple className="text-blue-900 w-24 h-24"/>
                <p className="text-6xl font-bold text-orange-600 mt-2">6+</p>
                <p className="text-xl font-bold text-gray-800 text-center mt-3">Industry Partners</p>
              </div>
            </div>

            {/*experience section */}
            <div className="flex flex-col items-center">
              <h1 className="font-bold text-orange-600 text-5xl">Experience SHPE UGA</h1>
              <p className="font-bold text-blue-950 pb-5">From career development to national conferences, SHPE UGA provides opportunities that go beyond the classroom</p>
            </div>
            
            <div className="grid grid-cols-2 gap-6 justify-center pb-32">
              
              <div className="bg-white rounded-2xl shadow-md flex flex-col w-90 h-80 overflow-hidden">
                <Image
                  src="/images/shpeIndustry.jpg"
                  alt="shpe industry photo"
                  width={400}
                  height={100}
                  className="object-cover w-full h-48"
                />  
                <div className="p-4 text-center">
                <p className="font-bold text-blue-950 mt-2">Industry Engagement</p>
                <p className="text-sm text-blue-950 mt-2">Company info session and networking opportunities that connect students directly with recruiters and professionals</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-md flex flex-col w-90 h-80 overflow-hidden">
                <Image
                  src="/images/shpeConf.jpg"
                  alt="Shpe nationals photo"
                  width={400}
                  height={100}
                  className="object-cover w-full h-48"
                />
                <div className="p-4 text-center">
                <p className="font-bold text-blue-950 mt-2">Conferences & Leadership</p>
                <p className="text-sm text-blue-950 mt-2">Members attend SHPE National Convention and regional events, building connections and gaining leadership experience</p>
                </div>
              </div> 

              <div className="bg-white rounded-2xl shadow-md flex flex-col w-90 h-80 overflow-hidden">
                <Image 
                  src="/images/shpeCareer.jpg"
                  alt="shpe career event"
                  width={400}
                  height={100}
                  className="object-cover w-full h-48"
                />
                <div className="p-4 text-center">
                  <p className="font-bold text-blue-950 mt-2">Career Development</p>
                  <p className="text-sm text-blue-950 mt-2">Resume workshops, portfolio building, and career fair preparation sessions that help members succeed professionally</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-md  flex flex-col  w-90 h-80 overflow-hidden">
                <Image 
                  src="/images/shpeCommunity.jpg" 
                  alt="horzontal shpe logo" 
                  width={400} 
                  height={100}
                  className="object-cover w-full h-48"
                />
                <div className="p-4 text-center">
                  <p className="font-bold text-blue-950 mt-2">Community & Events</p>
                  <p className="text-sm text-blue-950 mt-2">General body meetings, study sessions, and social events that create a strong and supportive community</p>
                </div>
              </div>

            </div>
          </div>
        </main>
        <div className="flex justify-center">
          <Footer/>
        </div>
    </div>
  );
}
