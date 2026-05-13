"use client"

import { createClient } from "@/utils/supabase/client"
import { useEffect, useState } from "react"
import NavBar from "../../components/NavBar"

type Member = {
  id: string
  first_name: string
  last_name: string
}

type BoardMember = {
  id: string
  member_id: string
  title: string
  bio: string
  photo_url: string
  members: {
    first_name: string
    last_name: string
  }
}

export default function ManageBoard() {
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [selectedMember, setSelectedMember] = useState("")
  const [title, setTitle] = useState("")
  const [bio, setBio] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    supabase.from('execBoard').select('*, members(first_name, last_name)').then(({ data }) => {
      if (data) setBoardMembers(data)
    })

    supabase.from('members').select('id, first_name, last_name').then(({ data }) => {
      if (data) setMembers(data)
      setLoading(false)
    })
  }, [])

  const addBoardMember = async () => {
    if (!selectedMember || !title) return
    const supabase = createClient()
    const { data, error } = await supabase
      .from('execBoard')
      .insert({ member_id: selectedMember, title, bio })
      .select('*, members(first_name, last_name)')
      .single()

    if (!error && data) {
      setBoardMembers([...boardMembers, data])
      setSelectedMember("")
      setTitle("")
      setBio("")
    }
  }

  const removeBoardMember = async (id: string) => {
    const supabase = createClient()
    await supabase.from('execBoard').delete().eq('id', id)
    setBoardMembers(boardMembers.filter(m => m.id !== id))
  }

  if (loading) return <div className="pt-20 p-8">Loading...</div>

  return (
    <main className="min-h-screen w-full bg-white">
      <NavBar />
      <div className="pt-24 px-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Manage Board</h1>

        {/* Add Board Member Form */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Add Board Member</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Select Member</label>
              <select
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md text-gray-900"
              >
                <option value="">Select a member</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.first_name} {m.last_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. President"
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md text-gray-900"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Short bio..."
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md text-gray-900"
                rows={3}
              />
            </div>
            <button
              onClick={addBoardMember}
              className="bg-red-500 text-white py-2 px-6 rounded-md hover:bg-red-600 transition-colors"
            >
              Add to Board
            </button>
          </div>
        </div>

        {/* Current Board Members */}
        <h2 className="text-xl font-bold mb-4 text-gray-900">Current Board Members</h2>
        <div className="flex flex-col gap-4">
          {boardMembers.map((member) => (
            <div key={member.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4">
              <div>
                <p className="font-bold text-gray-900">{member.members.first_name} {member.members.last_name}</p>
                <p className="text-red-600 text-sm">{member.title}</p>
                <p className="text-gray-600 text-sm mt-1">{member.bio}</p>
              </div>
              <button
                onClick={() => removeBoardMember(member.id)}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors text-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}