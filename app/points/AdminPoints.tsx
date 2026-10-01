"use client";

import { useRef, useState } from "react";
import { AwardHistory } from "./AwardHistory";
import { formatTime, type Dashboard, type Mutate, type PointsEvent } from "./types";

export default function AdminPoints({ data, busy, mutate }: { data: Dashboard; busy: boolean; mutate: Mutate }) {
    const [tab, setTab] = useState("events");
    const [search, setSearch] = useState("");
    const [semesterName, setSemesterName] = useState("");
    const semester = data.semesters.find(s => s.id === data.semester_id)!;
    const members = (data.members ?? []).filter(m => `${m.first_name} ${m.last_name} ${m.email}`.toLowerCase().includes(search.toLowerCase()));
    return <section>
        <div className="mb-6 flex flex-wrap gap-2" aria-label="Points management sections">
            {[["events", "Events"], ["award", "Award points"], ["members", "Member totals"], ["history", "Award history"], ["semesters", "Semesters"]].map(([id, label]) => <button key={id} className={tab === id ? "points-primary" : "points-secondary"} aria-pressed={tab === id} onClick={() => setTab(id)} disabled={busy}>{label}</button>)}
        </div>
        {tab === "events" && <div className="grid items-start gap-6 lg:grid-cols-2">
            <CreateEvent key={data.semester_id} data={data} disabled={busy || !semester.is_open} mutate={mutate} />
            <section><h2 className="mb-4 text-xl font-bold">Semester events</h2><div className="space-y-4">{data.events.length ? data.events.map(event => <AdminEvent key={event.id} event={event} criterion={data.criteria.find(c => c.code === event.criterion)?.label} busy={busy} mutate={mutate} />) : <p className="points-card text-slate-600">No events to show for {semester.name}.</p>}</div></section>
        </div>}
        {tab === "award" && <ManualAward key={data.semester_id} data={data} disabled={busy || !semester.is_open} mutate={mutate} />}
        {tab === "members" && <section><h2 className="mb-4 text-xl font-bold">Member totals · {semester.name}</h2><label className="mb-5 block max-w-md">Search members<input type="search" placeholder="Name or email" value={search} onChange={e => setSearch(e.target.value)} /></label><div className="grid gap-3 sm:grid-cols-2">{members.map(member => <article key={member.user_id} className="points-card"><p className="font-bold">{member.first_name} {member.last_name}</p><p className="mt-1 break-all text-sm text-slate-500">{member.email}</p><dl className="mt-4 flex flex-wrap gap-5"><div><dt className="text-sm text-slate-500">Points</dt><dd className="text-xl font-bold text-orange-700">{member.total}</dd></div><div><dt className="text-sm text-slate-500">Events</dt><dd className="text-xl font-bold">{member.event_count}</dd></div><div><dt className="text-sm text-slate-500">Rank</dt><dd className="text-xl font-bold">#{member.rank}</dd></div></dl></article>)}</div>{members.length === 0 && <p className="points-card">No members match your search.</p>}</section>}
        {tab === "history" && <section><h2 className="mb-4 text-xl font-bold">Recent awards · {semester.name}</h2><AwardHistory awards={data.recent_awards ?? []} admin busy={busy} mutate={mutate} /></section>}
        {tab === "semesters" && <div className="grid gap-6 md:grid-cols-2"><form className="points-card" onSubmit={async e => { e.preventDefault(); if (await mutate("points_create_semester", { p_name: semesterName }, "Semester created. Select it from the semester menu above.")) setSemesterName(""); }}><h2 className="mb-4 text-xl font-bold">Add a semester</h2><label>Semester name<input value={semesterName} onChange={e => setSemesterName(e.target.value)} placeholder="Spring 2027" required maxLength={80} disabled={busy} /></label><button className="points-primary mt-4" disabled={busy}>Create semester</button></form><section className="points-card"><h2 className="text-xl font-bold">{semester.name}</h2><p className="my-4 text-slate-600">Closing a semester stops new check-ins and manual awards. Its totals and history remain available, and admins can still void incorrect awards.</p><button className="points-secondary" disabled={busy} onClick={() => mutate("points_set_semester_open", { p_semester_id: semester.id, p_open: !semester.is_open }, semester.is_open ? "Semester closed." : "Semester reopened.")}>{semester.is_open ? "Close semester" : "Reopen semester"}</button></section></div>}
    </section>;
}

function AdminEvent({ event, criterion, busy, mutate }: { event: PointsEvent; criterion?: string; busy: boolean; mutate: Mutate }) {
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    return <article className="points-card">
        <h3 className="font-bold">{event.title}</h3>
        <p className="mt-2 text-slate-600">{criterion} · {event.points} points</p>
        <p className="mt-2 text-sm text-slate-500">{formatTime(event.opens_at)} – {formatTime(event.closes_at)} ET</p>
        <p className="my-3 text-sm">Check-in {event.is_open ? "enabled during this time window" : "disabled"}.</p>
        {confirmingDelete ? <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-900">Delete this event? It will disappear from event lists and stop accepting check-ins. Points already earned and award history will stay.</p>
            <div className="mt-3 flex flex-wrap gap-3">
                <button type="button" className="points-secondary text-red-700" disabled={busy} onClick={() => void mutate("points_delete_event", { p_event_id: event.id }, "Event deleted. Existing points and award history were kept.")}>Confirm delete</button>
                <button type="button" className="points-secondary" disabled={busy} onClick={() => setConfirmingDelete(false)}>Cancel</button>
            </div>
        </div> : <div className="flex flex-wrap gap-3">
            <button type="button" className="points-secondary" disabled={busy} onClick={() => void mutate("points_set_event_open", { p_event_id: event.id, p_open: !event.is_open }, event.is_open ? "Event check-in disabled." : "Event check-in enabled within its scheduled window.")}>{event.is_open ? "Disable check-in" : "Enable check-in"}</button>
            <button type="button" className="points-secondary text-red-700" disabled={busy} onClick={() => setConfirmingDelete(true)}>Delete event</button>
        </div>}
    </article>;
}

function CreateEvent({ data, disabled, mutate }: { data: Dashboard; disabled: boolean; mutate: Mutate }) {
    const requestId = useRef<string | null>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const [error, setError] = useState("");
    return <form ref={formRef} className="points-card" onChange={() => { requestId.current = null; }} onSubmit={async e => {
        e.preventDefault();
        setError("");
        const form = new FormData(e.currentTarget);
        const password = String(form.get("password"));
        if (new TextEncoder().encode(password).length > 72) { setError("Password must be 72 bytes or fewer; use a shorter password."); return; }
        const opens = new Date(String(form.get("opens")));
        const closes = new Date(String(form.get("closes")));
        if (!Number.isFinite(opens.getTime()) || !Number.isFinite(closes.getTime()) || closes <= opens) { setError("Choose a closing time after the opening time."); return; }
        requestId.current ??= crypto.randomUUID();
        if (await mutate("points_create_event", {
            p_id: requestId.current, p_semester_id: data.semester_id, p_title: form.get("title"), p_description: form.get("description"),
            p_criterion: form.get("criterion"), p_password: password, p_opens_at: opens.toISOString(), p_closes_at: closes.toISOString(),
        }, "Event created. Share its password with attendees.")) { requestId.current = null; formRef.current?.reset(); }
    }}>
        <h2 className="mb-4 text-xl font-bold">Create a password-locked event</h2>
        <p className="mb-5 text-sm text-slate-500">The event is visible to signed-in members. Its password unlocks one attendance award per member. Save the password before creating the event; it cannot be viewed afterward.</p>
        {error && <p role="alert" className="mb-4 text-red-700">{error}</p>}
        <fieldset disabled={disabled} className="space-y-4">
            <label>Event title<input name="title" required maxLength={120} placeholder="Fall 2026 GBM #2" /></label>
            <label>Activity type<select aria-label="Activity type" name="criterion" defaultValue="regular_gbm">{data.criteria.filter(c => c.is_event).map(c => <option key={c.code} value={c.code}>{c.label} · {c.points} pts</option>)}</select></label>
            <label>Description<textarea name="description" rows={3} maxLength={1000} placeholder="Location and details for members" /></label>
            <label>Event password<input name="password" type="password" required minLength={6} maxLength={72} autoComplete="new-password" /></label>
            <div className="grid gap-4 sm:grid-cols-2"><label>Check-in opens<input name="opens" type="datetime-local" required /></label><label>Check-in closes<input name="closes" type="datetime-local" required /></label></div>
            <p className="text-sm text-slate-500">Enter times in your device’s local timezone. Event listings display Eastern Time.</p>
            <button className="points-primary w-full" type="submit">Create event</button>
        </fieldset>
    </form>;
}
function ManualAward({ data, disabled, mutate }: { data: Dashboard; disabled: boolean; mutate: Mutate }) {
    const [userId, setUserId] = useState("");
    const [criterion, setCriterion] = useState("instagram_repost");
    const [quantity, setQuantity] = useState(1);
    const [note, setNote] = useState("");
    const [eventId, setEventId] = useState("");
    const requestId = useRef<string | null>(null);
    const points = (data.criteria.find(c => c.code === criterion)?.points ?? 0) * quantity;
    return <form className="points-card max-w-2xl" onSubmit={async e => {
        e.preventDefault();
        requestId.current ??= crypto.randomUUID();
        if (await mutate("points_award_manual", { p_request_id: requestId.current, p_semester_id: data.semester_id, p_user_id: userId, p_criterion: criterion, p_quantity: quantity, p_note: note, p_event_id: eventId || null }, "Points awarded. Member totals updated.")) { requestId.current = null; setNote(""); }
    }}>
        <h2 className="mb-3 text-xl font-bold">Award points manually</h2><p className="mb-5 text-sm text-slate-500">For attendance at an existing event, select that event to prevent a duplicate award if the member also checks in. Use standalone awards for reposts or activities not listed as events. Executive board members are not eligible and are excluded from the member list.</p>
        <fieldset disabled={disabled} className="space-y-4">
            <label>Member<select aria-label="Member" required value={userId} onChange={e => { setUserId(e.target.value); requestId.current = null; }}><option value="">Select a member</option>{data.members?.map(m => <option key={m.user_id} value={m.user_id}>{m.first_name} {m.last_name} · {m.email}</option>)}</select></label>
            <label>Linked event<select aria-label="Linked event" value={eventId} onChange={e => { setEventId(e.target.value); const event = data.events.find(item => item.id === e.target.value); if (event) { setCriterion(event.criterion); setQuantity(1); } requestId.current = null; }}><option value="">Standalone award</option>{data.events.map(event => <option key={event.id} value={event.id}>{event.title}</option>)}</select></label>
            <div className="grid gap-4 sm:grid-cols-[2fr_1fr]"><label>Activity type<select aria-label="Activity type" value={criterion} disabled={!!eventId} onChange={e => { setCriterion(e.target.value); requestId.current = null; }}>{data.criteria.map(c => <option key={c.code} value={c.code}>{c.label} · {c.points} pts</option>)}</select></label><label>Quantity<input type="number" inputMode="numeric" min={1} max={100} required value={quantity} disabled={!!eventId} onChange={e => { setQuantity(Number(e.target.value)); requestId.current = null; }} /></label></div>
            <label>Reason / activity details<textarea value={note} onChange={e => { setNote(e.target.value); requestId.current = null; }} placeholder="GBM #1 flyer repost verified on Instagram" required maxLength={500} rows={3} /></label>
            <p className="font-semibold">This award: <span className="text-orange-700">{points} points</span></p>
            <button type="submit" className="points-primary w-full">Award points</button>
        </fieldset>
    </form>;
}
