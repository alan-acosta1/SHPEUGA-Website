import Image from "next/image";
import NavBar from "./components/NavBar";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans ">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white">
        <NavBar/>
        <div className="flex flex-col gap-6 text-center items-center shadow-xl shadow-red-500 p-10 rounded-lg">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black">
            This is the start of the UGA SHPE Website.
          </h1>
          <p className="max-w-md text-lg leading-8 text-black">
            Over time we will be working towards a something we can all be proud of.
          </p>
          <p className="max-w-md text-lg leading-8 text-black">
            We will have a few checkpoints, but here are some general goals:
          </p>
          <ol className="list-disc list-inside text-left">
            <li className="text-md leading-8 text-black">Use github to manage changes and keep a version history of the website</li>
            <li className="text-md leading-8 text-black">Cover the basics of next.js and react to build website structure</li>
            <li className="text-md leading-8 text-black">Create functionality and authentication of login to create a user account</li>
            <li className="text-md leading-8 text-black">Add different views depending on user role (exec, member, visitor) to enable smooth website management</li>
          </ol>
          <p className="max-w-md text-lg leading-8 text-black">We want to create a website that can be easily passed down through each generation of execs.</p>
          <p className="max-w-md text-lg leading-8 text-black">I am currently working on making a discord server for announcements and updates.</p>
          <p className="max-w-md text-lg leading-8 text-black">As we work on this, please refer to resources under "Need Help?". I will keep adding more and more links as we go</p>
          </div>
      </main>
    </div>
  );
}
