"use client"

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function Login(){
    const [error,setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const handleSubmit = async(e:React.FormEvent)=> {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const supabase = createClient();
        const {data, error} = await supabase.auth.signInWithPassword({email,password});
        if(error){
            setError(error.message);
            setLoading(false);
        }else{  
                router.push(`/`)
        }
    }


    return (
        <div className="flex flex-col items-center justify-center">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
                {/*<h1 className="text-2xl font-bold text-center mb-6 text-gray-950">LogIn</h1>*/}
                {error && (
                    <p className="text-red-500 text-sm text-center mb-6">{error}</p>
                )}
                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="text-sm font-medium text-gray-700">UGA Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e)=> setEmail(e.target.value)}
                            placeholder="you@uga.edu"
                            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 placeholder:text-gray-300 text-gray-900"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="******"
                            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 placeholder:text-gray-300 text-gray-900"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                        {loading ? "Logging in" : "Login"}
                    </button>
                </form>
                <p className="text-sm text-center mt-4 text-gray-600">
                    <a href="/forgotpassword" className="text-red-500 hover:underline">
                        Forgot password?
                    </a>
                </p>
                <p className="text-sm text-center mt-4 text-gray-600">
                   Do not have an account?{" "}
                    <a href="/signup" className="text-red-500 hover:underline">
                        Sign up
                    </a>
                </p>
            </div>
        </div>

    )

}