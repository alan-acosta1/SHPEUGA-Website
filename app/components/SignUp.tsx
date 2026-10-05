"use client"

import { useState } from "react"
import Link from "next/link";
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
        setIdError(null);
        setYearError(null);
        setEmailError(null);
        const normalizedEmail = email.trim().toLowerCase();
        if(!firstName.trim() || !lastName.trim() || !normalizedEmail || !password || !schoolId || !major.trim() || !year){
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
        if(!/^[^\s@]+@uga\.edu$/.test(normalizedEmail)){
            setEmailError("Please enter UGA email");
            setLoading(false);
            return;
        }
        if(password.length < 8){
            setError("Password must be at least 8 characters");
            setLoading(false);
            return;
        }
        const supabase = createClient();
        try {
            const { data, error } = await supabase.auth.signUp({
                email: normalizedEmail,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/confirm`,
                    data: {
                        first_name: firstName.trim(),
                        last_name: lastName.trim(),
                        major: major.trim(),
                        school_year: year,
                        school_id: schoolId,
                    },
                },
            });
            if (error) {
                setError(error.message);
                return;
            }
            // Confirmation must be enabled in Supabase, otherwise signup logs in
            // immediately without proving ownership of the email address.
            if (data.session) {
                await supabase.auth.signOut();
                setError("Email verification is unavailable. Please contact UGA SHPE before trying again.");
                return;
            }
            // The database creates the member profile when the email is verified.
            router.push("/confirmemail");
        } catch {
            setError("Unable to create your account. Please try again.");
        } finally {
            setLoading(false);
        }
    }
    return(
        <div className="member-form flex w-full max-w-md flex-col items-center justify-center px-4 pb-8">
            <div className="w-full max-w-md p-5 sm:p-8 bg-white rounded-lg shadow-md">
                {error && (
                    <p className="text-red-500 text-sm text-center mb-6">{error}</p>
                )}
                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="text-sm font-medium text-gray-700">First Name</label>
                        <input
                            type="text"
                            autoComplete="given-name"
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
                            autoComplete="family-name"
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
                            inputMode="numeric" maxLength={9}
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
                            inputMode="numeric" maxLength={1}
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
                            autoComplete="email" autoCapitalize="none" spellCheck={false}
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
                            autoComplete="new-password"
                            value={password}
                            onChange={(e)=>setPassword(e.target.value)}
                            placeholder="******"
                            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 placeholder:text-gray-300 text-gray-900"
                        />
                    </div>
                    <p className="text-sm leading-6 text-gray-600">
                        Read our <Link href="/privacy" className="text-orange-800 underline underline-offset-4 hover:text-blue-950">Privacy Policy</Link> to learn how we use your account information.
                    </p>
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
