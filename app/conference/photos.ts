export type ConferencePhoto = {
    src: string;
    alt: string;
    caption: string;
    location: string;
    width: number;
    height: number;
};

// Column order pairs a portrait with a landscape to keep the album balanced.
export const conferencePhotos: ConferencePhoto[] = [
    {
        src: "/images/conference-2026/natty1.jpeg",
        alt: "UGA SHPE members in professional attire together outside in Indianapolis",
        caption: "Career Fair Ready",
        location: "Indianapolis · National Convention",
        width: 1290,
        height: 1604,
    },
    {
        src: "/images/conference-2026/natty3.jpeg",
        alt: "UGA SHPE members spending an evening together at a golf driving range",
        caption: "Off the floor. On the green.",
        location: "After hours · With the familia",
        width: 1920,
        height: 1080,
    },
    {
        src: "/images/conference-2026/natty2.jpeg",
        alt: "Three UGA SHPE members wearing convention badges and posing in front of international flags",
        caption: "UGA SHPEtinas at Convention",
        location: "National Convention · UGA SHPE",
        width: 1440,
        height: 1920,
    },
    {
        src: "/images/conference-2026/natty4.jpeg",
        alt: "UGA SHPE members posing together outdoors in downtown Indianapolis at night",
        caption: "A city to remember.",
        location: "Indianapolis · After hours",
        width: 1554,
        height: 1203,
    },
];
