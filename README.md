# SHPE UGA Website

The official website for the Society of Hispanic Professional Engineers (SHPE) chapter at the University of Georgia, serving 70+ members.

**Live site:** [shpeuga.com](https://shpeuga.com/)

## Features

- Public pages: about, events, sponsors, resources, exec board
- Member authentication: sign-up with UGA email verification, login, and password reset via Supabase Auth
- Self-service member profiles
- Role-based admin dashboard for managing members, protected by Postgres Row-Level Security and Next.js middleware
- Hardcoded executive board cards maintained in `app/board/members.ts`
- Auto-generated `sitemap.xml` and `robots.txt` for SEO

## Tech Stack

- [Next.js](https://nextjs.org/) (App Router) + React + TypeScript
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) (Auth + Postgres + RLS)
- Deployed on [Vercel](https://vercel.com/)

## Getting Started

Clone the repo and install dependencies:

```bash
npm install
```

Create a `.env` file in the project root with:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

Then run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

## Sending Authentication Emails with Resend

Supabase Auth manages accounts and generates verification and password-reset
links. Configure Resend as its custom SMTP provider to deliver these emails.
This is a hosted Supabase setting; changing this repository or installing the
Resend SDK alone does not activate it. No application redeployment is required.

### Requirements

- A Resend account with a verified sending domain you control, such as
  `shpeuga.com` or `auth.shpeuga.com`. Add the DNS records provided by Resend
  through your DNS provider and wait for verification.
- A Resend API key authorized to send from that domain.
- A sender address on the verified domain and a display name. For example,
  `no-reply@auth.shpeuga.com` and `SHPE UGA`, if `auth.shpeuga.com` is verified.
- Access to the Supabase project's Authentication settings.

### Configuration

In Supabase, open **Authentication → Email (under Notifications) → SMTP
Settings**, enable custom SMTP, and save these values:

| Setting | Value |
| --- | --- |
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | Your Resend API key |
| Sender email | Your address on the verified sending domain |
| Sender name | `SHPE UGA` |

Enter the API key directly in Supabase's SMTP password field. This integration
does not need a Resend key in the Next.js or Vercel environment, and the key must
never be included in browser code or a `NEXT_PUBLIC_*` variable.

Configure signup verification using the steps below. Keep the password-reset
template unchanged and include `https://shpeuga.com/resetpassword` in the allowed
redirect URLs (`http://localhost:3000/resetpassword` for local testing). Review
Supabase's email rate limits alongside your Resend sending limits.

### Verify the Switch

Using an account and inbox you control, request a password reset, confirm the
message appears in Resend's email logs, and follow the link through setting a
new password and logging in. If signup confirmation is enabled, also test a new
signup with a UGA email you control and follow its confirmation link. Delivery
and authentication should both succeed before considering the switch complete.

Reference: [Resend's Supabase SMTP guide](https://resend.com/docs/send-with-supabase-smtp)
and [Supabase custom SMTP documentation](https://supabase.com/docs/guides/auth/auth-smtp).

## Require Email Verification

The signup form sends member details as Supabase Auth metadata and opens the
existing `/confirmemail` page. That page can resend a verification email. The
member profile is created by a database trigger when Supabase confirms the email;
signup no longer inserts into `members` from an unauthenticated browser.

Complete these hosted settings before using this flow in production:

1. In Supabase **Authentication → Sign In / Providers → Email**, enable
   **Confirm email**. This is essential: with confirmation disabled, Supabase
   automatically marks new accounts as confirmed without verifying ownership.
   The signup form rejects an unexpected immediate session, but that browser
   check does not replace this hosted setting.
2. Run `supabase/migrations/202610050001_verified_member_signup.sql` in the
   Supabase SQL Editor as the project database owner, then deploy this code.
   The migration adds profile creation after verification and restrictive RLS
   policies requiring a verified email and blocking direct browser inserts.
   Existing member access and exec permissions still depend on the project's
   existing permissive RLS policies. Apply the migration and new frontend
   together: older signup code relies on browser inserts that are now blocked.
3. In **Authentication → URL Configuration**, set the production Site URL to
   `https://shpeuga.com`. Add `https://shpeuga.com/auth/confirm` to Redirect URLs,
   plus `http://localhost:3000/auth/confirm` for local testing. Add the exact
   callback URL for any other preview origin you use.
4. In **Authentication → Email → Confirm signup**, use this confirmation link:

   ```html
   <h2>Verify your UGA email</h2>
   <p>Confirm your email address to activate your UGA SHPE account.</p>
   <p><a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&amp;type=email">Verify email</a></p>
   ```

   The token-hash flow works even when the email opens in another browser or on
   another device. `/auth/confirm` also accepts a PKCE code from Supabase's
   default confirmation template when opened in the browser used for signup.
   Successful verification saves the session in cookies and opens `/profile`.
   Expired or invalid links return to `/confirmemail` with resend instructions.
5. Configure working SMTP delivery (see the Resend instructions above).

Existing profiles and roles are retained. Accounts previously auto-confirmed by
Supabase remain confirmed; enabling this setting does not retroactively prove
those users owned their inboxes. Older pending accounts that already have a
member profile can verify without new signup metadata. An older pending account
with no profile and no metadata needs administrator assistance to restore its
member details before confirmation.

Before release, use a UGA inbox you control to check that signup sends an email,
does not create a member row or allow login before verification, and creates
exactly one member profile after following the link. Check resend, an expired
link, confirmation in another browser, profile editing, password reset, and an
existing exec login. Direct member-table requests from anonymous or unverified
sessions must be rejected by RLS. Automated local checks run with `npm test`;
they do not validate hosted settings or actual email delivery.

Implementation references: [Supabase's Next.js confirmation flow](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs),
[user metadata and database triggers](https://supabase.com/docs/guides/auth/managing-user-data),
and [resending confirmation emails](https://supabase.com/docs/reference/javascript/auth-resend).

## Project Structure

- `app/` — pages and routes (Next.js App Router)
- `app/components/` — shared UI components
- `app/sitemap.ts` / `app/robots.ts` — SEO metadata routes served at `/sitemap.xml` and `/robots.txt`
- `utils/supabase/` — Supabase client setup (browser, server, and middleware)

## Updating the Executive Board

Edit `app/board/members.ts` to add, remove, or update a board member's name,
position, photo, or bio. The array order controls the order of the cards.
The board page no longer reads the `execBoard` database table or uses an admin editor.

Existing photos still use their public Supabase Storage URLs. For new local photos,
add the file to `public/images/` and use a path such as `/images/name.jpg` for
`photoUrl`. An empty `photoUrl` uses the SHPE logo. New external image hosts must
be allowed in `next.config.ts`.

## SHPEBytes Meeting Log

A log of each SHPEBytes meeting and what was covered.

### Meeting 1 — Oct. 15, 2025
Our goal was awareness of SHPEBytes and elaborating on what was expected to be achieved. We established our first project, the UGA SHPE Website.

## Member Points

Members can use the Points tab to check into password-locked events and view semester totals and history. Executive board admins can create events, award points manually, correct awards, and manage semesters.

Run the Supabase migration before enabling the feature. See [points setup and testing](docs/points-setup.md) for the SQL file and member/admin test steps.
