# WorkWave — Job Board

A modern, full-stack job board built with **Next.js 16 (App Router)**, **Prisma 7 + PostgreSQL**, and **Tailwind CSS v4**. Candidates can search and filter roles, view rich job detail pages, bookmark jobs, and apply — all without an account. Employers can post listings and review applications from a dashboard.

Deployed to **Vercel** via a **GitHub Actions CI/CD pipeline** (lint → typecheck → build → deploy).

<!-- Replace with your live URL once deployed -->
**Live demo:** _add your Vercel URL here_

---

## ✨ Highlights

- **Search + faceted filtering** — keyword, location, job type, experience level, category, remote-only, minimum salary, and sorting, all driven by shareable URLs.
- **Rich job pages** — description, requirements, benefits, skills, salary ranges, and a sticky apply form.
- **Apply flow** — validated application form writing to a real database.
- **Employer dashboard** — post jobs, see live application counts, review candidates, and delete listings.
- **ATS Resume Score Checker** — upload a PDF/DOCX/TXT resume, match it against a job or pasted description, and get an accurate 0–100 ATS score with keyword match, skills coverage, formatting checks, and tailored suggestions. Powered by real libraries (`unpdf`, `mammoth`, `natural`).
- **Admin panel** — password-protected `/admin` where an administrator controls the *entire* ATS engine: scoring criteria + weights, the skills/keyword dictionary, and every candidate report. Nothing in the scoring is hard-coded in the UI.
- **Saved jobs** — bookmark roles client-side (localStorage) with a live count in the navbar.
- **Production-grade DX** — typed end-to-end, server-validated with Zod, seeded demo data, and a green CI/CD pipeline.

See [`docs/FEATURES.md`](docs/FEATURES.md) for the full feature breakdown.

---

## 🧱 Tech stack

| Layer          | Choice                                                |
| -------------- | ----------------------------------------------------- |
| Framework      | Next.js 16 (App Router, Server Components, Turbopack) |
| Language       | TypeScript                                            |
| Styling        | Tailwind CSS v4                                       |
| Database       | PostgreSQL                                            |
| ORM            | Prisma 7 (driver adapters, `@prisma/adapter-pg`)      |
| Resume parsing | `unpdf` (PDF), `mammoth` (DOCX)                        |
| NLP / scoring  | `natural` (tokenize, stem, TF-IDF, fuzzy matching)    |
| Admin auth     | `jose` (signed JWT session) + Next.js middleware      |
| Validation     | Zod                                                   |
| Hosting        | Vercel                                                |
| CI/CD          | GitHub Actions → Vercel CLI                           |

---

## 🚀 Quick start (local)

### Prerequisites

- Node.js 20+
- A **PostgreSQL** database. **[Neon](https://neon.tech)** (free, serverless) is the easiest — the same cloud database works for local dev and for the Vercel deployment. Any managed Postgres (Supabase, Vercel Postgres, RDS) or a local Postgres instance works too.

### 1. Install

```bash
git clone <your-repo-url>
cd job-board
npm install        # runs `prisma generate` automatically (postinstall)
```

### 2. Configure the database

```bash
cp .env.example .env
```

Open `.env` and set `DATABASE_URL` to your Postgres connection string. For a
managed provider (Neon/Supabase/Vercel Postgres) use `?sslmode=verify-full`; for
a local Postgres use `?sslmode=disable`. While you're there, set `ADMIN_PASSWORD`
and `ADMIN_JWT_SECRET` for the `/admin` panel.

### 3. Create the schema and seed demo data

```bash
npm run db:setup   # prisma db push  +  prisma db seed
```

Or run the steps individually:

```bash
npm run db:push    # create tables from prisma/schema.prisma
npm run db:seed    # insert 10 realistic demo jobs
```

### 4. Run

```bash
npm run dev
# open http://localhost:3000
```

### Accessing the admin panel

The ATS engine is managed at **`/admin`**. Sign in with the password from your
`.env` (`ADMIN_PASSWORD`, default `admin123` for local dev — **change it for
production**). From there an admin controls scoring criteria/weights, the skills
dictionary, and every candidate report. The public ATS checker lives at **`/ats`**.

---

## 📜 npm scripts

| Script              | Description                            |
| ------------------- | -------------------------------------- |
| `npm run dev`       | Start the dev server                   |
| `npm run build`     | `prisma generate` + production build   |
| `npm start`         | Run the production build               |
| `npm run lint`      | ESLint                                 |
| `npm run typecheck` | `tsc --noEmit`                         |
| `npm run db:setup`  | Schema push + seed (one shot)          |
| `npm run db:push`   | Push the Prisma schema to the database |
| `npm run db:seed`   | Seed demo jobs                         |
| `npm run db:studio` | Open Prisma Studio (visual DB browser) |

---

## 🗂️ Project structure

```
job-board/
├── prisma/
│   ├── schema.prisma        # Job + Application models
│   └── seed.ts              # Demo data
├── prisma.config.ts         # Prisma 7 config (datasource url, seed)
├── src/
│   ├── middleware.ts             # Gates /admin and /api/admin behind auth
│   ├── app/
│   │   ├── page.tsx              # Home (hero, search, featured, ATS callout)
│   │   ├── jobs/                 # Listing + [id] detail + loading skeleton
│   │   ├── post-job/             # Post a job
│   │   ├── employer/             # Dashboard + [id] applications
│   │   ├── ats/                  # ATS Resume Score Checker (user-facing)
│   │   ├── admin/                # Admin: login + (dashboard) criteria/skills/reports
│   │   ├── saved/                # Bookmarked jobs
│   │   └── api/                  # REST API (see docs/API.md)
│   ├── components/
│   │   ├── ats/                  # Checker, score gauge, report renderer
│   │   ├── admin/                # Criteria/skills managers, nav, logout
│   │   └── …                     # Shared UI (JobCard, Navbar, …)
│   ├── lib/
│   │   ├── prisma.ts             # PrismaClient singleton (pg driver adapter)
│   │   ├── jobs.ts               # Query layer (filters, pagination)
│   │   ├── auth.ts               # Admin JWT session helpers (jose)
│   │   ├── ats/                  # extract.ts · nlp.ts · engine.ts · types.ts
│   │   ├── validations.ts        # Zod schemas
│   │   ├── constants.ts          # Enums/labels
│   │   ├── format.ts             # Salary/date helpers
│   │   └── useSavedJobs.ts       # localStorage bookmarks hook
│   └── generated/prisma/         # Generated Prisma client (git-ignored)
├── .github/workflows/ci-cd.yml   # CI/CD pipeline
├── vercel.json                   # Vercel build config
└── docs/                         # FEATURES · API · DEPLOYMENT
```

---

## 🚢 Deployment & CI/CD

Every push and PR runs the quality gate (lint, typecheck, build). Pull requests get a **Preview** deployment; merges to `main` get a **Production** deployment — all through the Vercel CLI.

Follow the step-by-step guide in **[`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)** to push to GitHub, provision a database, connect Vercel, and configure the pipeline secrets.

---

## 📚 Documentation

- [`docs/FEATURES.md`](docs/FEATURES.md) — every feature, explained
- [`docs/API.md`](docs/API.md) — REST API reference
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — GitHub + Vercel + CI/CD setup

---

## 📝 Notes & scope

This is a demo built for an assessment. To keep it approachable, authentication is intentionally omitted — the employer dashboard is open, and applications aren't gated. The [Roadmap in `docs/FEATURES.md`](docs/FEATURES.md#roadmap) lists what a production version would add (auth, file uploads, email notifications, full-text search).
