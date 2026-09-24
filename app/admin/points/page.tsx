import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import PointsDashboard from "../../points/PointsDashboard";
export default async function AdminPointsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");
    const { data: member } = await supabase.from("members").select("role").eq("user_id", user.id).single();
    if (member?.role !== "exec") redirect("/points");
    return <PointsDashboard adminView />;
}
