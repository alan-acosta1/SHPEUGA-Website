"use client";

import { useSyncExternalStore } from "react";

const calendarUrl = "https://calendar.google.com/calendar/embed?src=7b226ceb99d2b8be29de0d391fcc8ff27b2e30b6b4a2bcb80467bb0b1c533882%40group.calendar.google.com&ctz=America%2FNew_York";
const mobileQuery = "(max-width: 767px)";
function subscribe(onChange: () => void) {
    const media = window.matchMedia(mobileQuery);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
}

export default function EventCalendar() {
    const mobile = useSyncExternalStore(subscribe, () => window.matchMedia(mobileQuery).matches, () => false);
    return <>
        <iframe
            title="UGA SHPE chapter events calendar"
            src={`${calendarUrl}${mobile ? "&mode=AGENDA&showTitle=0&showPrint=0&showCalendars=0" : ""}`}
            className="h-[560px] w-full border-0 md:h-[600px]"
        />
        <a href={calendarUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-11 items-center text-blue-950 underline underline-offset-4">Open calendar in a new tab</a>
    </>;
}
