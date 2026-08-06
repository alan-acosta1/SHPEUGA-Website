"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"

export default function ForgotPassword(){
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [message, setMessage] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setMessage("")

        if (!email) {
            setError("Please enter your email")
            return
        }

        setLoading(true)
        const supabase = createClient()
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/resetpassword`,
        })
        setLoading(false)

        if (error) {
            setError(error.message)
        } else {
            setMessage("Check your email for a link to reset your password")
        }
    }

    return (
        <div className="flex flex-col items-center justify-center">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
                {error && (
                    <p className="text-red-500 text-sm text-center mb-6">{error}</p>
                )}
                {message && (
                    <p className="text-green-600 text-sm text-center mb-6">{message}</p>
                )}
                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="text-sm font-medium text-gray-700">UGA Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@uga.edu"
                            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 placeholder:text-gray-300 text-gray-900"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                        {loading ? "Sending..." : "Send Reset Link"}
                    </button>
                </form>
                <p className="text-sm text-center mt-4 text-gray-600">
                    Remember your password?{" "}
                    <a href="/login" className="text-red-500 hover:underline">
                        Log In
                    </a>
                </p>
            </div>
        </div>
    )
}
