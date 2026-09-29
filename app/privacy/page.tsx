import type { Metadata } from "next";
import Footer from "../components/Footer";
import NavBar from "../components/NavBar";

export const metadata: Metadata = {
    title: "Privacy Policy | UGA SHPE",
    description: "How UGA SHPE handles website account information, member points, and privacy requests.",
};

const linkClass = "font-medium text-orange-800 underline underline-offset-4 hover:text-blue-950";

function ContactLink() {
    return <a href="mailto:asa42887@uga.edu" className={linkClass}>asa42887@uga.edu</a>;
}

export default function PrivacyPage() {
    return (
        <div className="flex min-h-screen flex-col bg-white text-slate-700">
            <NavBar />
            <main className="mx-auto w-full max-w-3xl flex-1 px-5 pb-12 pt-28 sm:px-8 sm:pt-36">
                <h1 className="text-3xl font-bold text-blue-950 sm:text-4xl">Privacy Policy</h1>
                <p className="mt-3 text-sm text-slate-500">Effective date: <time dateTime="2026-09-28">September 28, 2026</time></p>
                <div className="mt-8 space-y-8 break-words text-base leading-7 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-blue-950 [&_p+p]:mt-4">
                    <section aria-labelledby="scope">
                        <h2 id="scope">About this policy</h2>
                        <p>This policy explains how the UGA SHPE executive board handles information collected through shpeuga.com. The SHPEBytes Chair administers the website. For privacy questions or requests, contact <ContactLink />.</p>
                        <p>This policy describes website information practices. The account deletion process below applies to the website&apos;s active database.</p>
                    </section>
                    <section aria-labelledby="information">
                        <h2 id="information">Information we collect</h2>
                        <p>When you create an account, we collect your first and last name, UGA email address, student ID number, academic year, and major. We also maintain an account identifier and membership role. Supabase Auth handles your password and stores a password hash rather than the readable password.</p>
                        <p>When you participate in the points program, we record event check-ins, participation categories, points awarded, the relevant semester, dates, and administrative notes or corrections. Records may identify the administrator who awarded or changed points. We also maintain failed check-in counts and timing information to limit repeated unsuccessful attempts.</p>
                        <p>We publish executive-board names, positions, and photographs. If you contact us about your account, we receive the information you include in your message.</p>
                        <p>Our hosting and analytics services process technical information associated with visits, such as requested pages, browser and device information, and network information needed to deliver the website. Vercel Web Analytics provides traffic statistics that may include page views, referring sites, approximate location, and browser or device type.</p>
                    </section>
                    <section aria-labelledby="use">
                        <h2 id="use">How we use information</h2>
                        <p>We use information to create and manage accounts, support student-affiliation verification, maintain chapter membership records, track event participation and points, prepare UGA SHPE reports, respond to account requests, and operate and improve the website.</p>
                        <p>Student IDs are collected for student-affiliation verification and chapter reporting. Providing an ID number does not by itself constitute university verification.</p>
                        <p>The website uses email for account-related messages, including password resets. It does not currently send newsletters or promotional email.</p>
                    </section>
                    <section aria-labelledby="access">
                        <h2 id="access">Access and sharing</h2>
                        <p>The SHPEBytes Chair is currently the only chapter administrator with access to the website database and member administration tools. The chapter president receives chapter reports; receiving these reports does not provide direct access to the database or website administration tools.</p>
                        <p>Signed-in members can view their own profile and points history. Public pages display chapter information, events, executive-board profiles, and general information about the points system; they do not display individual members&apos; student IDs or points histories.</p>
                        <p>We use the following services to operate the site:</p>
                        <ul className="my-4 list-disc space-y-3 pl-6">
                            <li><strong>Vercel:</strong> website hosting and Web Analytics. See <a href="https://vercel.com/docs/analytics/privacy-policy" className={linkClass}>Vercel&apos;s analytics privacy documentation</a>.</li>
                            <li><strong>Supabase:</strong> account authentication, member and points databases, and storage of executive-board photographs. See <a href="https://supabase.com/docs/guides/auth/password-security" className={linkClass}>Supabase&apos;s password security documentation</a>.</li>
                            <li><strong>Google Calendar:</strong> an embedded calendar on the events page. Loading the calendar connects your browser to Google, which may process technical information and use cookies under <a href="https://policies.google.com/privacy" className={linkClass}>Google&apos;s Privacy Policy</a>.</li>
                        </ul>
                        <p>Links to Instagram and other external websites take you to services with their own privacy practices.</p>
                    </section>
                    <section aria-labelledby="cookies">
                        <h2 id="cookies">Cookies and sign-in</h2>
                        <p>The website uses authentication cookies to maintain your sign-in session. Blocking these cookies may prevent account features from working. Vercel states that its Web Analytics does not use third-party cookies; this does not mean the entire website is cookie-free. Embedded Google content may use separate cookies.</p>
                    </section>
                    <section aria-labelledby="deletion">
                        <h2 id="deletion">Retention and deletion</h2>
                        <p>Membership records are currently maintained manually. Points history is retained across semesters; starting a new semester does not delete earlier records. There is currently no fixed automatic deletion schedule.</p>
                        <p>You may contact <ContactLink /> to request correction or deletion of your account information. Please use the email associated with your account and do not send your password. A self-service account deletion feature is planned but is not currently available.</p>
                        <p>When an account is deleted, we remove all information associated with that account from the website&apos;s active database, including its authentication account, member profile, student ID, event participation, points history, and associated account records.</p>
                        <p>Our website account deletion commitment covers the active database. It does not promise immediate removal from any provider backups that may exist.</p>
                    </section>
                    <section aria-labelledby="choices">
                        <h2 id="choices">Your choices</h2>
                        <p>You can browse public chapter pages without registering. Registration is needed to use member account and points features. You can update your name, major, and academic year through your profile, and contact the administrator about other corrections or privacy requests.</p>
                    </section>
                    <section aria-labelledby="changes">
                        <h2 id="changes">Changes and contact</h2>
                        <p>We will update this policy when our information practices change and revise its effective date. Contact the UGA SHPE website administrator at <ContactLink /> with questions.</p>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}
