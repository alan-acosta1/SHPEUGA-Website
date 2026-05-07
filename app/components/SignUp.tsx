"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
export default function SignUp(){
    const [error, setError] = useState<string | null>(null);
    const [idError, setIdError] = useState<string | null>(null);
    const [yearError, setYearError] = useState<string | null>(null);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [loading,setLoading] = useState(false);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [schoolId, setSchoolId] = useState("");
    const [major, setMajor] = useState("");
    const [year, setYear] = useState("");
    const router = useRouter();
    const handleSubmit = async (e:React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        if(!firstName || !lastName || !email || !password || !schoolId || !major || !year){
            setError("Please fill in all fields");
            setLoading(false);
            return;
            }
        if(schoolId.length !== 9){
            setIdError("School ID must be 9 digits");
            setLoading(false);
            return;
        }
        if(year.length !== 1){
            setYearError("Only enter one digit");
            setLoading(false);
            return;
        }
        if(!email.endsWith('@uga.edu')){
            setEmailError("Please enter UGA email");
            setLoading(false);
            return;
        }
        const supabase = createClient();
        const {data, error} = await supabase.auth.signUp({email,password});
        if(error){
            setError(error.message);
            setLoading(false);
        }else{
            const {error: insertError} = await supabase.from('members').insert({first_name: firstName,last_name:lastName,email:email,major:major,school_year:year,school_id:schoolId,role:"member"})
            if(insertError){
                setError(insertError.message);
                setLoading(false);
            }else{
                router.push(`/login`)
            }
        }
    }
    return(
        <div className="flex flex-col items-center justify-center">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
                {error && (
                    <p className="text-red-500 text-sm text-center mb-6">{error}</p>
                )}
                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="text-sm font-medium text-gray-700">First Name</label>
                        <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="First Name"
                            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 placeholder:text-gray-300 text-gray-900"
                        />

                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Last Name</label>
                        <input
                            type="text"
                            value={lastName}
                            onChange={(e)=> setLastName(e.target.value)}
                            placeholder="Last Name"
                            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 placeholder:text-gray-300 text-gray-900"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Student ID #</label>
                        <input
                            type="text"
                            value={schoolId}
                            onChange={(e) =>{
                                const value = e.target.value.replace(/[^0-9]/g, '')
                                setSchoolId(value)
                            }}
                            placeholder="810/811 #"
                            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 placeholder:text-gray-300 text-gray-900"
                        />
                         {idError && (
                                <p className="text-red-500 text-xs mt-1">{idError}</p>
                            )}
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Year</label>
                        <input
                            type="text"
                            value={year}
                            onChange={(e)=>{
                                const value = e.target.value.replace(/[^0-9]/g, '')
                                setYear(value)
                            }}
                            placeholder="Year"
                            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 placeholder:text-gray-300 text-gray-900"
                        />
                        {yearError && (
                            <p className="text-red-500 text-xs mt-1">{yearError}</p>

                        )}
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Major</label>
                        <input
                            type="text"
                            value={major}
                            onChange={(e)=> setMajor(e.target.value)}
                            placeholder="Major"
                            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 placeholder:text-gray-300 text-gray-900"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">UGA Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e)=> setEmail(e.target.value)}
                            placeholder="you@uga.edu"
                            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 placeholder:text-gray-300 text-gray-900"
                        />
                        {emailError && (
                            <p className="text-red-500 text-xs mt-1">{emailError}</p>
                        )}
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e)=>setPassword(e.target.value)}
                            placeholder="******"
                            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 placeholder:text-gray-300 text-gray-900"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                        {loading ? "Registering" : "Register"}
                    
                    </button>

                </form>
                <p className="text-sm text-center  text-gray-600">
                    Already have an account? {" "}
                    <a href="/login" className="text-red-500 hover:underline">
                    Log In
                    </a>
                </p>

            </div>
        </div>
    )

}