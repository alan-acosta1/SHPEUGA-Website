"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import NavBar from "../components/NavBar";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Footer";
import AdminPoints from "./AdminPoints";
import { AwardHistory } from "./AwardHistory";
import { criteria, eventStatus, formatTime, type Dashboard, type Mutate, type PointsEvent } from "./types";

type Phase = "loading" | "ready" | "guest" | "setup" | "error";

export default function PointsDashboard({ adminView = false }: { adminView?: boolean }) {
    const { user } = useAuth();
    return <PointsContent key={user?.id ?? "guest"} adminView={adminView} />;
}

function PointsContent({ adminView }: { adminView: boolean }) {
    const { user, loading: authLoading } = useAuth();
    const userId = user?.id;
    const [data, setData] = useState<Dashboard | null>(null);
    const [semesterId, setSemesterId] = useState("");
    const [phase, setPhase] = useState<Phase>("loading");
    const [notice, setNotice] = useState<{ error: boolean; message: string } | null>(null);
    const [busy, setBusy] = useState(false);
    const [now, setNow] = useState(0);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        const tick = () => setNow(Date.now());
        tick();
        const interval = setInterval(tick, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchDashboard = useCallback(async () => {
        const supabase = createClient();
        if (!userId) return { phase: "guest" as Phase, data: null };
        const result = await supabase.rpc("points_dashboard", { p_semester_id: semesterId || null });
        if (result.error) {
            if (["PGRST202", "42883"].includes(result.error.code)) return { phase: "setup" as Phase, data: null };
            throw new Error(result.error.message);
        }
        return { phase: "ready" as Phase, data: result.data as Dashboard };
    }, [semesterId, userId]);

    useEffect(() => {
        if (authLoading) return;
        let cancelled = false;
        fetchDashboard().then(result => {
            if (!cancelled) {
                setData(result.data); setPhase(result.phase);
                if (result.data && !semesterId) setSemesterId(result.data.semester_id);
            }
        }).catch(error => {
            if (!cancelled) { setData(null); setPhase("error"); setNotice({ error: true, message: error.message }); }
        });
        return () => { cancelled = true; };
    }, [fetchDashboard, refreshKey, semesterId, authLoading]);

    const mutate: Mutate = async (name, args, success) => {
        setBusy(true);
        setNotice(null);
        try {
            const result = await createClient().rpc(name, args);
            if (result.error) {
                if (name === "points_delete_event" && result.error.code === "PGRST202") {
                    throw new Error("Event deletion is not set up yet. Apply the points event deletion SQL migration in Supabase, then try again.");
                }
                throw new Error(result.error.message);
            }
            if (result.data?.ok === false) throw new Error(result.data.message);
            if (name === "points_delete_event") {
                // Keep a successfully deleted event hidden even if the refresh fails.
                setData(current => current ? { ...current, events: current.events.filter(event => event.id !== args.p_event_id) } : current);
            }
            setNotice({ error: false, message: result.data?.message || success });
            try {
                const refreshed = await fetchDashboard();
                setData(refreshed.data);
                setPhase(refreshed.phase);
            } catch {
                setNotice({ error: false, message: `${success} Your changes were saved, but totals could not refresh. Use Refresh to reload.` });
            }
            return true;
        } catch (error) {
            setNotice({ error: true, message: error instanceof Error ? error.message : "Something went wrong. Please try again." });
            return false;
        } finally { setBusy(false); }
    };
    const selected = data?.semesters.find(semester => semester.id === data.semester_id);

    return <div className="flex min-h-screen flex-col bg-zinc-50 text-blue-950">
        <NavBar />
        <main className="points-page mx-auto w-full max-w-6xl flex-1 px-4 pb-16 pt-28 sm:px-6">
            <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
                <div><h1 className="text-3xl font-bold text-orange-600 sm:text-4xl">{adminView ? "Manage points" : "Member points"}</h1><p className="mt-3 max-w-2xl text-slate-600">Show up, get involved, and track your progress with SHPE UGA. Points start fresh each semester; your history stays available.</p></div>
                {data?.is_admin && <Link href={adminView ? "/points" : "/admin/points"} className="points-secondary">{adminView ? "Points overview" : "Manage points"}</Link>}
            </div>
            {notice && <div role={notice.error ? "alert" : "status"} className={`mb-6 rounded-lg border p-4 ${notice.error ? "border-red-200 bg-red-50 text-red-800" : "border-green-200 bg-green-50 text-green-800"}`}>{notice.message}</div>}
            {phase === "loading" && <p role="status" className="points-card">Loading points…</p>}
            {phase === "guest" && <div className="points-card mb-8"><h2 className="text-xl font-bold">Your involvement counts.</h2><p className="my-4 text-slate-600">Sign in to see your total and enter the password shared at an event to check in.</p><Link href="/login" className="points-primary">Sign in to view points</Link></div>}
            {phase === "setup" && <div className="points-card mb-8"><h2 className="text-xl font-bold">Points are not available yet</h2><p className="mt-3 text-slate-600">The chapter is setting up the points tracker. Please check back soon.</p>{adminView && <p className="mt-3 text-sm text-slate-600">Run the member points SQL migration in Supabase, then refresh this page. See <code>docs/points-setup.md</code> in the project.</p>}<button className="points-secondary mt-4" onClick={() => { setPhase("loading"); setRefreshKey(key => key + 1); }}>Refresh</button></div>}
            {phase === "error" && <button className="points-secondary mb-6" onClick={() => { setPhase("loading"); setRefreshKey(key => key + 1); }}>Try again</button>}
            {phase === "ready" && data && <>
                <div className="mb-6 flex flex-wrap items-end gap-3">
                    <label className="min-w-0 flex-1 sm:max-w-xs">Semester<select aria-label="Semester" value={data.semester_id} disabled={busy} onChange={event => { setPhase("loading"); setNotice(null); setSemesterId(event.target.value); }}>{data.semesters.map(semester => <option key={semester.id} value={semester.id}>{semester.name}{semester.is_open ? "" : " (closed)"}</option>)}</select></label>
                    <button className="points-secondary" disabled={busy} onClick={() => { setPhase("loading"); setRefreshKey(key => key + 1); }}>Refresh</button>
                </div>
                {!selected?.is_open && <p className="mb-6 rounded-lg bg-amber-50 p-4 text-amber-900">This semester is closed. You can still view its history; new check-ins and awards are paused.</p>}
                {adminView ? (data.is_admin ? <AdminPoints data={data} busy={busy} mutate={mutate} /> : <p className="points-card">Only chapter admins can manage points.</p>) : <>
                    {data.is_admin ? <p className="points-card mb-8">Executive board members do not receive points or appear in semester rankings. You can still manage events and award points to members.</p> : <>
                    <section aria-label="Your semester summary" className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {[["Total points", data.summary?.total ?? 0], ["Events attended", data.summary?.event_count ?? 0], ["Semester rank", data.summary?.rank ? `#${data.summary.rank}` : "—"]].map(([label, value]) => <div key={label} className="points-card"><p className="text-sm font-semibold text-slate-600">{label}</p><p className="mt-3 text-4xl font-bold text-orange-600">{value}</p></div>)}
                    </section>
                    <section className="mb-10"><h2 className="mb-2 text-2xl font-bold">Event check-in</h2><p className="mb-5 text-slate-600">Enter the event password to earn points once. Check-in times are shown in Eastern Time.</p><div className="grid gap-4 md:grid-cols-2">{data.events.length ? data.events.map(event => <EventCheckIn key={event.id} event={event} status={eventStatus(event, !!selected?.is_open, now)} busy={busy} mutate={mutate} />) : <p className="points-card md:col-span-2">No events have been added for this semester yet.</p>}</div></section>
                    </>}
                    <section className="mb-10"><h2 className="mb-5 text-2xl font-bold">Your points history</h2><AwardHistory awards={data.awards} /></section>
                </>}
            </>}
            <section className="points-card mt-8"><h2 className="mb-4 text-xl font-bold">How to earn points</h2><dl className="divide-y divide-slate-100">{(data?.criteria ?? criteria).map(criterion => <div key={criterion.code} className="flex items-center justify-between gap-4 py-3"><dt>{criterion.label}</dt><dd className="shrink-0 font-bold text-orange-700">{criterion.points} {criterion.points === 1 ? "point" : "points"}</dd></div>)}</dl><p className="mt-4 text-sm text-slate-500">Executive board members are not eligible to earn points. Instagram reposts are verified and awarded by admins. Tied totals share the same rank.</p></section>
        </main>
        <div className="flex justify-center"><Footer /></div>
    </div>;
}

function EventCheckIn({ event, status, busy, mutate }: { event: PointsEvent; status: string; busy: boolean; mutate: Mutate }) {
    const [password, setPassword] = useState("");
    return <article className="points-card flex flex-col"><div className="flex items-start justify-between gap-3"><h3 className="text-lg font-bold">{event.title}</h3><span className="shrink-0 rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-800">{event.points} pts</span></div>{event.description && <p className="mt-3 whitespace-pre-line text-slate-600">{event.description}</p>}<p className="mt-4 text-sm text-slate-500">{formatTime(event.opens_at)} – {formatTime(event.closes_at)} ET</p><p className="my-3 font-semibold">{status}</p>
        {status === "Open" && <form className="mt-auto" onSubmit={async e => { e.preventDefault(); if (await mutate("points_check_in", { p_event_id: event.id, p_password: password }, "Check-in recorded.")) setPassword(""); }}><label>Event password<input type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="off" maxLength={72} disabled={busy} /></label><button type="submit" className="points-primary mt-3 w-full" disabled={busy}>{busy ? "Please wait…" : "Check in"}</button></form>}
    </article>;
}
