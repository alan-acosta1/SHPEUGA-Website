import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import EventCalendar from "../components/EventCalendar";
export default function EventPage() {
  return (
    <main className="min-h-screen w-full bg-white flex flex-col items-center">
      <NavBar />
      <div className="w-full max-w-5xl pt-28 pb-16 px-3 sm:px-8 md:py-32">
        <h1 className="text-3xl font-bold text-black text-center mb-8">Events</h1>
        <EventCalendar />
      </div>
      <Footer/>

    </main>
  )
}