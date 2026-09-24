export type Criterion = { code: string; label: string; points: number; is_event: boolean };
export type Semester = { id: string; name: string; is_open: boolean };
export type PointsEvent = { id: string; title: string; description: string; criterion: string; points: number; opens_at: string; closes_at: string; is_open: boolean; claimed: boolean };
export type Award = { id: string; user_id: string; criterion: string; quantity: number; points: number; note: string; source: string; created_at: string; voided_at: string | null; void_reason: string | null; event_id: string | null; event_title: string | null; member_name?: string; awarded_by_name?: string };
export type MemberScore = { user_id: string; first_name: string; last_name: string; email: string; total: number; event_count: number; rank: number };
export type Dashboard = { is_admin: boolean; user_id: string; semester_id: string; semesters: Semester[]; criteria: Criterion[]; summary: { total: number; event_count: number; rank: number }; events: PointsEvent[]; awards: Award[]; members?: MemberScore[]; recent_awards?: Award[] };
export type Mutate = (name: string, args: Record<string, unknown>, success: string) => Promise<boolean>;
export const criteria: Criterion[] = [
    { code: "first_gbm", label: "First GBM", points: 5, is_event: true },
    { code: "regular_gbm", label: "Regular GBM", points: 1, is_event: true },
    { code: "social_event", label: "Social/Event", points: 1, is_event: true },
    { code: "professional_development", label: "Professional Development Event", points: 2, is_event: true },
    { code: "instagram_repost", label: "Instagram Flyer Repost", points: 1, is_event: false },
];
export function eventStatus(event: PointsEvent, semesterOpen: boolean, now: number) {
    if (event.claimed) return "Recorded";
    if (!semesterOpen || !event.is_open || now >= Date.parse(event.closes_at)) return "Closed";
    if (now < Date.parse(event.opens_at)) return "Upcoming";
    return "Open";
}
export function formatTime(value: string) {
    return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "America/New_York" }).format(new Date(value));
}
