import Link from "next/link"
import {redirect} from "next/navigation"
import { createClient } from "@/utils/supabase/server"
export default async function adminMenu(){

  const supabase = await createClient();
  const {data:{user}} = await supabase.auth.getUser();

  if (!user) redirect('/login')
  
  const {data:member} = await supabase
    .from('members')
    .select('role')
    .eq('user_id',user.id)
    .single()
  if (member?.role !== 'exec') redirect('/')


    return(
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 px-4 sm:px-8">
  <Link href="/admin/manageMembers">
    <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
      <h2 className="text-xl font-bold text-gray-900">Manage Members</h2>
      <p className="text-gray-600 mt-2">View, update roles, and delete members</p>
    </div>
  </Link>

  <Link href="/admin/points">
    <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <h2 className="text-xl font-bold text-gray-900">Manage Points</h2>
      <p className="text-gray-600 mt-2">Create check-in events, award points, and review semester totals</p>
    </div>
  </Link>
</div>
    )

}
