# SHPE UGA Website

The official website for the Society of Hispanic Professional Engineers (SHPE) chapter at the University of Georgia, serving 70+ members.

**Live site:** [shpeuga.com](https://shpeuga.com/)

## Features

- Public pages: about, events, sponsors, resources, exec board
- Member authentication: sign-up, login, and password reset via Supabase Auth
- Self-service member profiles
- Role-based admin dashboard for managing members and exec board content, protected by Postgres Row-Level Security and Next.js middleware
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

## Project Structure

- `app/` — pages and routes (Next.js App Router)
- `app/components/` — shared UI components
- `app/sitemap.ts` / `app/robots.ts` — SEO metadata routes served at `/sitemap.xml` and `/robots.txt`
- `utils/supabase/` — Supabase client setup (browser, server, and middleware)

## SHPEBytes Meeting Log

A log of each SHPEBytes meeting and what was covered.

### Meeting 1 — Oct. 15, 2025
Our goal was awareness of SHPEBytes and elaborating on what was expected to be achieved. We established our first project, the UGA SHPE Website.
