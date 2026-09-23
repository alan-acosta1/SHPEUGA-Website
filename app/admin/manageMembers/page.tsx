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
      <div className="pt-28 px-4 sm:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Manage Members</h1>
        <table className="member-table w-full border-collapse">
          <thead>
            <tr className="bg-gray-900">
              <th scope="col" className="text-left p-4 border border-gray-200">Name</th>
              <th scope="col" className="text-left p-4 border border-gray-200">Email</th>
              <th scope="col" className="text-left p-4 border border-gray-200">Major</th>
              <th scope="col" className="text-left p-4 border border-gray-200">Year</th>
              <th scope="col" className="text-left p-4 border border-gray-200">Role</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-red-200">
                <td data-label="Name" className="p-4 border border-gray-900 text-gray-900"><span>{member.first_name} {member.last_name}</span></td>
                <td data-label="Email" className="p-4 border border-gray-900 text-gray-900"><span>{member.email}</span></td>
                <td data-label="Major" className="p-4 border border-gray-900 text-gray-900"><span>{member.major}</span></td>
                <td data-label="Year" className="p-4 border border-gray-900 text-gray-900"><span>{member.school_year}</span></td>
                <td data-label="Role" className="p-4 border border-gray-900 text-gray-900">
                  <select
                    aria-label={`Role for ${member.first_name} ${member.last_name}`}
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