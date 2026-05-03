import SignUp from "../components/SignUp";
import NavBar from "../components/NavBar";

export default function SignUpPage(){
    return(
        <main className="min-h-screen w-full bg-white flex flex-col items-center">
            <NavBar></NavBar>
                <div className="pt-28">
                    <h1 className="text-blue-950 text-3xl font-bold text-center mt-8 mb-4">
                        Create Account
                    </h1>
                </div>
                    <SignUp></SignUp>
            </main>
    )

}
