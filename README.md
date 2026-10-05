# SHPE UGA Website

The official website for the Society of Hispanic Professional Engineers (SHPE) chapter at the University of Georgia, serving 70+ members.

**Live site:** [shpeuga.com](https://shpeuga.com/)

## Features

- Public pages: about, events, sponsors, resources, exec board
- Member authentication: sign-up, login, and password reset via Supabase Auth
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

Supabase Auth manages accounts and generates password-reset
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

Keep signup confirmation disabled as described below. Keep the password-reset
template unchanged and include `https://shpeuga.com/resetpassword` in the allowed
redirect URLs (`http://localhost:3000/resetpassword` for local testing). Review
Supabase's email rate limits alongside your Resend sending limits.

### Verify the Switch

Using an account and inbox you control, request a password reset, confirm the
message appears in Resend's email logs, and follow the link through setting a
new password and logging in. Delivery and authentication should both succeed
before considering the switch complete.

Reference: [Resend's Supabase SMTP guide](https://resend.com/docs/send-with-supabase-smtp)
and [Supabase custom SMTP documentation](https://supabase.com/docs/guides/auth/auth-smtp).

## Signup Without Email Verification

In Supabase **Authentication → Sign In / Providers → Email**, turn **Confirm
email OFF** and save. Signup then creates a session immediately and opens the
member profile. Supabase marks these accounts confirmed automatically; users do
not have to follow an email link. Changing this hosted setting needs no redeploy.

Keep `supabase/migrations/202610050001_verified_member_signup.sql` installed.
Its database trigger creates member profiles from signup metadata, always with
role `member`. Automatic confirmation runs that trigger without an email step.
The frontend no longer inserts profiles, so it does not conflict with the
migration's policy blocking browser inserts. Existing RLS rules and executive
role checks continue to control access. For a fresh database, install the
migration before enabling signup on the website.

`/confirmemail` now redirects to `/login`. The `/auth/confirm` endpoint remains
only for previously issued links and returns invalid links to login. Resend SMTP
continues to deliver password-reset emails. Existing users, profiles, and points
are retained. Any already-pending unconfirmed accounts need administrator review;
changing the setting is not a bulk update to existing users.

To check the flow, register a new UGA account and verify that its member profile
opens immediately, with one member row in Supabase. Also test an existing login,
password reset, and executive access. Automated checks run with `npm test`.

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
