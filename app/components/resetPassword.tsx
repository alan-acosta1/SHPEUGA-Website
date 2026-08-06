"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"

export default function ResetPassword(){
   const [newPassword, setNewPassword] = useState("")
   const [confirmPassword, setConfirmPassword] = useState("")
   const [loading, setLoading] = useState(false)
   const [message, setMessage] = useState("")
   const [error, setError] = useState<string | null>(null)
   const [sessionReady, setSessionReady] = useState(false)
   const router = useRouter()

   useEffect(() => {
      const supabase = createClient()

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
         if (event === "PASSWORD_RECOVERY") {
            setSessionReady(true)
         }
      })

      supabase.auth.getSession().then(({ data: { session } }) => {
         if (session) setSessionReady(true)
      })

      return () => subscription.unsubscribe()
   }, [])

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setError(null)
      setMessage("")

      if (!newPassword || !confirmPassword) {
         setError("Please fill in both fields")
         return
      }
      if (newPassword.length < 6) {
         setError("Password must be at least 6 characters")
         return
      }
      if (newPassword !== confirmPassword) {
         setError("Passwords do not match")
         return
      }

      setLoading(true)
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      setLoading(false)

      if (error) {
         setError(error.message)
      } else {
         setMessage("Password updated successfully. Redirecting to login...")
         setTimeout(() => router.push("/login"), 2000)
      }
   }

   if (!sessionReady) {
      return (
         <div className="flex flex-col items-center justify-center">
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
               <p className="text-center text-gray-600">
                  Verifying reset link...
               </p>
            </div>
         </div>
      )
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
                  <label className="text-sm font-medium text-gray-700">New Password</label>
                  <input
                     type="password"
                     value={newPassword}
                     onChange={(e) => setNewPassword(e.target.value)}
                     placeholder="******"
                     className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 placeholder:text-gray-300 text-gray-900"
                  />
               </div>
               <div>
                  <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                  <input
                     type="password"
                     value={confirmPassword}
                     onChange={(e) => setConfirmPassword(e.target.value)}
                     placeholder="******"
                     className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 placeholder:text-gray-300 text-gray-900"
                  />
               </div>
               <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition-colors disabled:opacity-50"
               >
                  {loading ? "Updating..." : "Update Password"}
               </button>
            </form>
         </div>
      </div>
   )
}
