import NavBar from "../components/NavBar";
import ForgotPassword from "../components/ForgotPassword";

export default function ForgotPasswordPage(){
    return(
        <main className="min-h-screen w-full bg-white flex flex-col items-center">
        <NavBar></NavBar>
        <div className="pt-28">
            <h1 className="text-blue-950 text-3xl font-bold text-center mt-8 mb-4">
                Forgot Password
            </h1>
        </div>
            <ForgotPassword></ForgotPassword>

       </main>
    )
}
