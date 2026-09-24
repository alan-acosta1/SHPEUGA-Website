"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { useAuth } from "../context/AuthContext"

type Member = {
    id: string
    first_name: string
    last_name: string
    email: string
    major: string
    school_year: string
    school_id: string
    role: string
}

export default function Profile(){
    const { user } = useAuth()
    return <MemberProfile key={user?.id ?? "guest"} />
}

function MemberProfile(){
    const { user, loading: authLoading } = useAuth()
    const userId = user?.id
    const [retry, setRetry] = useState(0)
    const [member, setMember] = useState<Member | null>(null)
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [major, setMajor] = useState("")
    const [year, setYear] = useState("")
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [message, setMessage] = useState("")
    const router = useRouter()

    useEffect(() => {
        if (authLoading) return
        if (!userId) {
            router.replace("/login")
            return
        }
        let cancelled = false
        const loadProfile = async () => {
            try {
                const { data, error } = await createClient()
                    .from("members").select("*").eq("user_id", userId).single()
                if (error) throw error
                if (cancelled) return
                if (data) {
                    setMember(data)
                    setFirstName(data.first_name)
                    setLastName(data.last_name)
                    setMajor(data.major)
                    setYear(String(data.school_year))
                }
            } catch {
                if (!cancelled) setError("Could not load your profile. Please try again.")
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        void loadProfile()
        return () => { cancelled = true }
    }, [router, userId, authLoading, retry])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setMessage("")

        if (!firstName || !lastName || !major || !year) {
            setError("Please fill in all fields")
            return
        }
        if (year.length !== 1) {
            setError("Year must be a single digit")
            return
        }

        if (!member) return
        setSaving(true)
        try {
            const { error } = await createClient().from("members")
                .update({ first_name: firstName, last_name: lastName, major, school_year: year })
                .eq("id", member.id)
            if (error) throw error
            setMessage("Profile updated")
            setMember({ ...member, first_name: firstName, last_name: lastName, major, school_year: year })
        } catch {
            setError("Could not save your profile. Please try again.")
        } finally { setSaving(false) }
    }

    if (authLoading || loading) return <div className="p-8 text-center text-gray-600" role="status">Loading...</div>
    if (!member) return <div className="p-8 text-center text-gray-600">
        <p role={error ? "alert" : undefined}>{error || "Profile not found"}</p>
        <button type="button" className="mt-4 min-h-11 rounded bg-blue-950 px-5 py-2 text-white" onClick={() => { setLoading(true); setError(null); setRetry(value => value + 1) }}>Try again</button>
    </div>

    return (
        <div className="member-form flex w-full max-w-md flex-col items-center justify-center px-4 pb-8">
            <div className="w-full max-w-md p-5 sm:p-8 bg-white rounded-lg shadow-md">
                {error && (
                    <p className="text-red-500 text-sm text-center mb-6">{error}</p>
                )}
                {message && (
                    <p className="text-green-600 text-sm text-center mb-6">{message}</p>
                )}
                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="text-sm font-medium text-gray-700">First Name</label>
                        <input
                            type="text"
                            autoComplete="given-name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Last Name</label>
                        <input
                            type="text"
                            autoComplete="family-name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Major</label>
                        <input
                            type="text"
                            value={major}
                            onChange={(e) => setMajor(e.target.value)}
                            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Year</label>
                        <input
                            type="text"
                            inputMode="numeric" maxLength={1}
                            value={year}
                            onChange={(e) => setYear(e.target.value.replace(/[^0-9]/g, ""))}
                            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            autoComplete="email" autoCapitalize="none" spellCheck={false}
                            value={member.email}
                            disabled
                            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Student ID</label>
                        <input
                            type="text"
                            value={member.school_id}
                            disabled
                            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Role</label>
                        <input
                            type="text"
                            value={member.role}
                            disabled
                            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 capitalize"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </form>
                <p className="text-sm text-center mt-4 text-gray-600">
                    <a href="/forgotpassword" className="text-red-500 hover:underline">
                        Change Password
                    </a>
                </p>
            </div>
        </div>
    )
}
