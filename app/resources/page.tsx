import Image from "next/image";
import NavBar from "../components/NavBar";

export default function page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans ">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white shadow-xl sm:items-start">
        <NavBar/>
        <div className="flex flex-col items-center p-20 gap-6 text-center sm:items-start shadow-xl shadow-red-500 sm:text-left">
          <p className="max-w-md text-lg leading-8 text-black">
            Looking for a starting point or more instructions?
          </p>
          <p className="max-w-md text-lg leading-8 text-black">
            For styling check out</p>
            <u>
              <a className= " border-solid text-black hover:text-red-500 transition-colors"href="https://tailwindcss.com/docs/installation/using-vite">Tailwind CSS Docs </a>
            </u>
          <p className="max-w-md text-lg leading-8 text-black">
            For components:</p>
            <u>
              <a className= " border-solid text-black hover:text-red-500 transition-colors"href="https://nextjs.org/docs/app/getting-started">Next.js Docs </a>
            </u>
          
          </div>
      </main>
    </div>
  );
}
