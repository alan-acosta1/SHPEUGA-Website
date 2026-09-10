import NavBar from "../components/NavBar";
import ExecCard from "../components/BoardCard";
import Footer from "../components/Footer";
import { boardMembers } from "./members";

export default function BoardPage() {
    return (
        <main className="min-h-screen w-full bg-white flex flex-col items-center">
            <NavBar />
            <div className="w-full max-w-7xl flex flex-col items-center py-32 px-16">
                <h1 className="text-center text-3xl text-black font-bold">
                    UGA SHPE Executive Board
                </h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
                    {boardMembers.map((member) => (
                        <ExecCard key={member.name} {...member} />
                    ))}
                </div>
            </div>
            <Footer />
        </main>
    );
}
