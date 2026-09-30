"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"
import { invalidRecoveryMessage, readRecoveryLink, updateRecoveredPassword } from "@/utils/supabase/password-recovery"
import { useRouter } from "next/navigation"
import { useAuth } from "../context/AuthContext"

export default function ResetPassword(){
   const [newPassword, setNewPassword] = useState("")
   const [confirmPassword, setConfirmPassword] = useState("")
   const [loading, setLoading] = useState(false)
   const [message, setMessage] = useState("")
   const [error, setError] = useState<string | null>(null)
   const [linkReady, setLinkReady] = useState(false)
   const [hasToken, setHasToken] = useState(false)
   const [linkError, setLinkError] = useState<string | null>(null)
   const [verified, setVerified] = useState(false)
   const tokenHash = useRef<string | null>(null)
   const submitting = useRef(false)
   const { user, loading: authLoading } = useAuth()
   const sessionReady = hasToken || verified || (!authLoading && !!user)
   const router = useRouter()

   useEffect(() => {
      let active = true
      // Read browser-only link state after hydration. Do not call verifyOtp on
      // page load: email security scanners can visit links before the user.
      queueMicrotask(() => {
         if (!active) return
         const link = readRecoveryLink(window.location.hash, window.location.search)
         tokenHash.current = link.tokenHash
         setHasToken(!!link.tokenHash)
         setLinkError(link.error)
         setLinkReady(true)
         if (link.tokenHash || link.error) {
            window.history.replaceState(window.history.state, "", window.location.pathname)
         }
      })
      return () => { active = false }
   }, [])

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      if (submitting.current || message || !sessionReady || linkError) return
      setError(null)
      setMessage("")

      if (!newPassword || !confirmPassword) {
         setError("Please fill in both fields")
         return
      }
      if (newPassword.length < 8) {
         setError("Password must be at least 8 characters")
         return
      }
      if (newPassword !== confirmPassword) {
         setError("Passwords do not match")
         return
      }

      submitting.current = true
      setLoading(true)
      try {
         const resetError = await updateRecoveredPassword(createClient().auth, tokenHash.current, newPassword, () => {
            tokenHash.current = null
            setHasToken(false)
            setVerified(true)
         })
         if (resetError === invalidRecoveryMessage) {
            setLinkError(resetError)
         } else if (resetError) {
            setError(resetError)
         } else {
            setNewPassword("")
            setConfirmPassword("")
            setMessage("Password updated successfully. Redirecting to login...")
            setTimeout(() => router.push("/login"), 2000)
         }
      } catch {
         setError("Unable to reset your password. Check your connection and try again.")
      } finally {
         submitting.current = false
         setLoading(false)
      }
   }

   if (!linkReady || (authLoading && !hasToken && !linkError)) {
      return (
         <div className="member-form flex w-full max-w-md flex-col items-center justify-center px-4 pb-8">
            <div className="w-full max-w-md p-5 sm:p-8 bg-white rounded-lg shadow-md">
               <p className="text-center text-gray-600">
                  Verifying reset link...
               </p>
            </div>
         </div>
      )
   }

   if (linkError || !sessionReady) {
      return (
         <div className="member-form w-full max-w-md px-4 pb-8">
            <div className="rounded-lg bg-white p-5 text-center shadow-md sm:p-8">
               <p role="alert" className="mb-4 text-gray-700">
                  {linkError || "Open the link in your reset email to choose a new password."}
               </p>
               <Link href="/forgotpassword" className="font-medium text-red-600 underline">
                  Request a new reset email
               </Link>
            </div>
         </div>
      )
   }

   return (
      <div className="member-form flex w-full max-w-md flex-col items-center justify-center px-4 pb-8">
         <div className="w-full max-w-md p-5 sm:p-8 bg-white rounded-lg shadow-md">
            {error && (
               <p role="alert" className="text-red-500 text-sm text-center mb-6">{error}</p>
            )}
            {message && (
               <p role="status" className="text-green-600 text-sm text-center mb-6">{message}</p>
            )}
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
               <div>
                  <label htmlFor="new-password" className="text-sm font-medium text-gray-700">New Password</label>
                  <input
                     id="new-password"
                     required
                     minLength={8}
                     disabled={loading || !!message}
                     type="password"
                            autoComplete="new-password"
                     value={newPassword}
                     onChange={(e) => setNewPassword(e.target.value)}
                     placeholder="******"
                     className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 placeholder:text-gray-300 text-gray-900"
                  />
               </div>
               <div>
                  <label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">Confirm Password</label>
                  <input
                     id="confirm-password"
                     required
                     minLength={8}
                     disabled={loading || !!message}
                     type="password"
                            autoComplete="new-password"
                     value={confirmPassword}
                     onChange={(e) => setConfirmPassword(e.target.value)}
                     placeholder="******"
                     className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 placeholder:text-gray-300 text-gray-900"
                  />
               </div>
               <button
                  type="submit"
                  disabled={loading || !!message}
                  className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition-colors disabled:opacity-50"
               >
                  {loading ? "Updating..." : "Update Password"}
               </button>
            </form>
         </div>
      </div>
   )
}
