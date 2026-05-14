import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
export default function EventPage() {
  return (
    <main className="min-h-screen w-full bg-white flex flex-col items-center">
      <NavBar />
      <div className="w-full max-w-5xl py-32 px-8">
        <h1 className="text-3xl font-bold text-black text-center mb-8">Events</h1>
        <iframe
          src="https://calendar.google.com/calendar/embed?src=7b226ceb99d2b8be29de0d391fcc8ff27b2e30b6b4a2bcb80467bb0b1c533882%40group.calendar.google.com&ctz=America%2FNew_York"
          className="w-full"
          height="600"
          frameBorder="0"
          scrolling="no"
        />
      </div>
      <Footer/>

    </main>
  )
}