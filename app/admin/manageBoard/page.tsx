"use client"

import { createClient } from "@/utils/supabase/client"
import { useEffect, useState } from "react"
import NavBar from "../../components/NavBar"
import { create } from "domain"



type BoardMember = {
  id: string
  name:string
  title: string
  bio: string
  photo_url: string
  order_index: number
}

export default function ManageBoard() {
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([])
  const [name, setName] = useState("")
  const [title, setTitle] = useState("")
  const [bio, setBio] = useState("")
  const [loading, setLoading] = useState(true)
  const [photo, setPhoto] = useState<File | null> (null)

  const [editingId, setEditingId] = useState<string | null >(null)
  const [editBio, setEditBio] = useState("")

  useEffect(() =>{
    const supabase = createClient();
    supabase.from('execBoard').select('*').then(({data}) =>{
      if(data) setBoardMembers(data)
      setLoading(false)
    })
  },[])

  const addBoardMember = async () => {
    alert(`name: ${name}, title: ${title}, photo: ${photo?.name}`)
    if (!name || !title) return
    const supabase = createClient()
    let photo_url = ""
    if(photo){
      const fileExt = photo.name.split('.').pop()
      const fileName = `${name.replace(' ', '-')}-${Date.now()}.${fileExt}`
      const {error: uploadError} = await supabase
        .storage
        .from('exec_photos')
        .upload(fileName, photo)
      alert(uploadError ? 'Upload failed: ' + uploadError.message : 'Upload succeeded!')
      if (!uploadError){
        const {data} = supabase.storage.from('exec_photos').getPublicUrl(fileName)
        photo_url = data.publicUrl
        console.log('photo_url: ', photo_url)
      }else{
        console.log('No photo selected')
      }
    }
    const {data,error} = await supabase
      .from('execBoard')
      .insert({name,title,bio,photo_url})
      .select('*')
      .single()
    if (!error && data){
      setBoardMembers([...boardMembers, data])
      setName("")
      setTitle("")
      setBio("")
      setPhoto(null)
    }
  }
  const removeBoardMember = async (id: string) => {
    const supabase = createClient()
    await supabase.from('execBoard').delete().eq('id', id)
    setBoardMembers(boardMembers.filter(m => m.id !== id))
  }

  const startEditingBio = (member: BoardMember) => {
    setEditingId(member.id)
    setEditBio(member.bio)
  }

  const cancelEditingBio = () =>{
    setEditingId(null)
    setEditBio("")
  }
  const saveBio = async(id:string) =>{
    const supabase= createClient()
    const {error} = await supabase
      .from('execBoard')
      .update({bio: editBio})
      .eq('id',id)
    if (!error){
      setBoardMembers(boardMembers.map(m=> m.id === id ? {...m, bio: editBio} : m))
      setEditingId(null)
      setEditBio("")
    }else{
      alert('Failed to update bio: ' + error.message)
    }
  }
  if(loading) return <div className="pt-20 p-8">Loading</div>


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
              <label className="text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder= "first and last"
                className="w-full mt-1 px-4 py-2 border-gray-300 rounded-md text-gray-900"
              />
            
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
            <div>
              <label className="text-sm font-medium text-gray-700">Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  console.log('file selected:', file)
                  setPhoto(file || null)
                }}
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md text-gray-900"
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
              <div className="flex-1">
                <p className="font-bold text-gray-900">{member.name}</p>
                <p className="text-red-600 text-sm">{member.title}</p>

                {editingId === member.id ? (
                  <div className="mt-2">
                    <textarea
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 text-sm"
                      rows={3}
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => saveBio(member.id)}
                        className="bg-red-500 text-white px-4 py-1 rounded-md hover:bg-red-600 transition-colors text-sm">
                        Save
                      </button>
                      <button
                        onClick={cancelEditingBio}
                        className="bg-gray-200 text-gray-700 px-4 py-1 rounded-md hover:bg-gray-300 transition-colors text-sm">
                        Cacnel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm mt-1">{member.bio}</p>

                  )}
              </div>
              <div className="flex flex-col gap-2 ml-4">
                {editingId !== member.id && (
                  <button
                    onClick={() => startEditingBio(member)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors text-sm">
                      Edit Bio
                  </button>
                )}
                <button
                  onClick={()=> removeBoardMember(member.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors text-sm">
                    Remove
                </button>
               </div>
              </div>  
                ))}
              </div>
            </div>
          </main>
  )
}