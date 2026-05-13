"use client"

import { createClient } from "@/utils/supabase/client"
import { useEffect, useState } from "react"
import NavBar from "../../components/NavBar"

type Member = {
  id: string
  first_name: string
  last_name: string
  email: string
  role: string
  major: string
  school_year: number
}

export default function ManageMembers() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('members').select('*').then(({ data }) => {
      if (data) setMembers(data)
      setLoading(false)
    })
  }, [])

  const updateRole = async (id: string, newRole: string) => {
    const supabase = createClient()
    await supabase.from('members').update({ role: newRole }).eq('id', id)
    setMembers(members.map(m => m.id === id ? { ...m, role: newRole } : m))
  }

  if (loading) return <div className="pt-20 p-8">Loading...</div>

  return (
    <main className="min-h-screen w-full bg-white">
      <NavBar />
      <div className="pt-24 px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Manage Members</h1>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-900">
              <th className="text-left p-4 border border-gray-200">Name</th>
              <th className="text-left p-4 border border-gray-200">Email</th>
              <th className="text-left p-4 border border-gray-200">Major</th>
              <th className="text-left p-4 border border-gray-200">Year</th>
              <th className="text-left p-4 border border-gray-200">Role</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-gray-900">
                <td className="p-4 border border-gray-900 text-gray-900">{member.first_name} {member.last_name}</td>
                <td className="p-4 border border-gray-900 text-gray-900">{member.email}</td>
                <td className="p-4 border border-gray-900 text-gray-900">{member.major}</td>
                <td className="p-4 border border-gray-900 text-gray-900">{member.school_year}</td>
                <td className="p-4 border border-gray-900 text-gray-900">
                  <select
                    value={member.role}
                    onChange={(e) => updateRole(member.id, e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  >
                    <option value="member">Member</option>
                    <option value="exec">Exec</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}