
import NavBar from "../components/NavBar";
import ConfirmEmail from "../components/ConfirmEmail";

export default async function ConfirmEmailPage({ searchParams }: {
    searchParams: Promise<{ error?: string }>;
}) {
    const params = await searchParams;
    return (
        <main className="flex min-h-screen w-full flex-col items-center bg-white pb-12">
            <NavBar />
            <div className="w-full max-w-lg px-4 pt-28 text-center sm:pt-36">
                <h1 className="mb-4 text-3xl font-bold text-blue-950">Check your UGA email</h1>
                <p className="mb-8 text-gray-600">Verify your email address to finish joining our member community.</p>
                <ConfirmEmail invalidLink={params.error === "invalid_link"} />
            </div>
        </main>
    );
}
