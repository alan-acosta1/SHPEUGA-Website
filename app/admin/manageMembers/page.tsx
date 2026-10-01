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
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

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

  const deleteMember = async (member: Member) => {
    const name = `${member.first_name} ${member.last_name}`.trim()
    if (!window.confirm(`Permanently delete ${name} (${member.email})? This removes their account and cannot be undone.`)) return

    setError(null)
    setDeletingId(member.id)
    const supabase = createClient()
    const { error: deleteError } = await supabase.rpc('admin_delete_member', { target_member_id: String(member.id) })
    setDeletingId(null)

    if (deleteError) {
      setError(`Could not delete ${name}: ${deleteError.message}`)
      return
    }
    setMembers(prev => prev.filter(m => m.id !== member.id))
  }

  if (loading) return <div className="pt-20 p-8">Loading...</div>

  return (
    <main className="min-h-screen w-full bg-white">
      <NavBar />
      <div className="pt-28 px-4 sm:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Manage Members</h1>
        {error && (
          <p role="alert" className="mb-6 rounded border border-red-300 bg-red-50 p-4 text-red-800">{error}</p>
        )}
        <table className="member-table w-full border-collapse">
          <thead>
            <tr className="bg-gray-900">
              <th scope="col" className="text-left p-4 border border-gray-200">Name</th>
              <th scope="col" className="text-left p-4 border border-gray-200">Email</th>
              <th scope="col" className="text-left p-4 border border-gray-200">Major</th>
              <th scope="col" className="text-left p-4 border border-gray-200">Year</th>
              <th scope="col" className="text-left p-4 border border-gray-200">Role</th>
              <th scope="col" className="text-left p-4 border border-gray-200">Actions</th>
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
                <td data-label="Actions" className="p-4 border border-gray-900 text-gray-900">
                  <button
                    type="button"
                    onClick={() => deleteMember(member)}
                    disabled={member.role === 'exec' || deletingId === member.id}
                    title={member.role === 'exec' ? 'Change role to Member before deleting' : undefined}
                    aria-label={`Delete ${member.first_name} ${member.last_name}`}
                    className="min-h-[44px] rounded bg-red-600 px-3 py-1 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600"
                  >
                    {deletingId === member.id ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}