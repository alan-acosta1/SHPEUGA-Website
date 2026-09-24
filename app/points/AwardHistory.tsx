"use client";

import { useState } from "react";
import { criteria, formatTime, type Award, type Mutate } from "./types";

export function AwardHistory({ awards, admin = false, busy = false, mutate }: { awards: Award[]; admin?: boolean; busy?: boolean; mutate?: Mutate }) {
    return <div className="space-y-3">{awards.length ? awards.map(award => <AwardRow key={award.id} award={award} admin={admin} busy={busy} mutate={mutate} />) : <p className="points-card text-slate-600">No points have been recorded for this semester yet.</p>}<p className="text-sm text-slate-500">{admin ? "Showing the 500 most recent entries." : "Showing your 200 most recent entries."} Totals include all active entries. Voided awards remain in history and do not count toward totals.</p></div>;
}
function AwardRow({ award, admin, busy, mutate }: { award: Award; admin: boolean; busy: boolean; mutate?: Mutate }) {
    const [correcting, setCorrecting] = useState(false);
    const [reason, setReason] = useState("");
    return <article className="points-card"><div className="flex items-start justify-between gap-4"><div className="min-w-0">{admin && <p className="font-bold">{award.member_name || "Member"}</p>}<p className="font-semibold">{award.event_title || criteria.find(c => c.code === award.criterion)?.label}</p><p className="mt-1 whitespace-pre-line text-slate-600">{award.note}</p><p className="mt-2 text-sm text-slate-500">{formatTime(award.created_at)} ET · {award.source === "check_in" ? "Event check-in" : `Manual award${admin && award.awarded_by_name ? ` by ${award.awarded_by_name}` : ""}`} · Quantity: {award.quantity}</p></div><p className={`shrink-0 text-xl font-bold ${award.voided_at ? "text-slate-400 line-through" : "text-orange-700"}`}>+{award.points}</p></div>
        {award.voided_at && <p className="mt-3 text-sm text-red-700">Voided: {award.void_reason}</p>}
        {admin && !award.voided_at && mutate && (correcting ? <form className="mt-4" onSubmit={async e => { e.preventDefault(); if (await mutate("points_void_award", { p_award_id: award.id, p_reason: reason }, "Award voided. Totals updated.")) setCorrecting(false); }}><label>Reason for correction<input value={reason} onChange={e => setReason(e.target.value)} required maxLength={500} disabled={busy} /></label><div className="mt-3 flex flex-wrap gap-3"><button className="points-primary" disabled={busy} type="submit">Void award</button><button className="points-secondary" disabled={busy} type="button" onClick={() => setCorrecting(false)}>Cancel</button></div></form> : <button className="points-secondary mt-3" disabled={busy} onClick={() => setCorrecting(true)}>Correct this award</button>)}
    </article>;
}
