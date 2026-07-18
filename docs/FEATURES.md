# WorkWave — Feature Documentation

This document describes **every feature** in the WorkWave job board, who it's for, how to use it, and how it works under the hood. It doubles as a functional spec and a UX walkthrough.

## Contents

1. [Navigation & layout](#1-navigation--layout)
2. [Home page](#2-home-page)
3. [Search](#3-search)
4. [Job listing & filtering](#4-job-listing--filtering)
5. [Sorting & pagination](#5-sorting--pagination)
6. [Job detail page](#6-job-detail-page)
7. [Applying to a job](#7-applying-to-a-job)
8. [Saved jobs (bookmarks)](#8-saved-jobs-bookmarks)
9. [Posting a job](#9-posting-a-job)
10. [Employer dashboard](#10-employer-dashboard)
11. [Reviewing applications](#11-reviewing-applications)
12. [System & UX details](#12-system--ux-details)
13. [Data model](#13-data-model)
14. [ATS Resume Score Checker](#14-ats-resume-score-checker)
15. [Admin panel](#15-admin-panel)
16. [Roadmap](#roadmap)

---

## 1. Navigation & layout

A sticky top navbar is present on every page with:

- **WorkWave logo** → home
- **Browse jobs** → `/jobs`
- **For employers** → `/employer`
- **Saved jobs** bookmark icon with a **live count badge**
- **Post a job** primary call-to-action

A footer repeats the primary links and states the tech stack. The layout is fully responsive; on small screens the "For employers" link collapses and the filters sidebar becomes a toggle.

**Under the hood:** `src/app/layout.tsx` wraps all pages with `<Navbar>` and `<Footer>`. The saved-count badge (`SavedCount`) is a client component subscribed to the bookmarks store.

---

## 2. Home page

**Route:** `/`

The landing page is designed to get a candidate searching within seconds:

- **Hero** with a headline, subcopy, and a prominent dual-field **search bar** (keyword + location).
- **Live stat pill** — "N open roles across M companies", pulled from the database at request time.
- **Popular searches** — quick links (Engineering, Design, Remote, Product).
- **Stats strip** — open roles, companies, and remote-job counts.
- **Featured roles** — up to three `featured` jobs rendered as cards.
- **Browse by category** — a grid linking into pre-filtered listings.
- **Employer CTA** — a call to post a job.

**Under the hood:** a Server Component that calls `getFeaturedJobs()` and `getStats()` (`src/lib/jobs.ts`). Rendered dynamically so counts are always current.

---

## 3. Search

**Where:** hero search bar (home) and the top of `/jobs`.

- **Keyword** matches job **title**, **company**, **description**, and **tags** (case-insensitive).
- **Location** matches the job location (case-insensitive substring), so `remote`, `Berlin`, or `US` all work.

Submitting the search routes to `/jobs?q=…&location=…`. Because state lives in the URL, any search is **shareable and bookmarkable**.

**Under the hood:** `SearchBar` (client) builds query params; `buildWhere()` in `src/lib/jobs.ts` translates them into a Prisma `where` clause using `OR` + `contains`/`has`.

---

## 4. Job listing & filtering

**Route:** `/jobs`

The core discovery page: a filters sidebar on the left, results on the right.

Available filters (each updates the URL and re-queries):

| Filter               | Options                                                    |
| -------------------- | --------------------------------------------------------- |
| **Remote only**      | toggle                                                     |
| **Job type**         | Full-time, Part-time, Contract, Internship, Temporary     |
| **Experience level** | Internship, Entry, Mid, Senior, Lead/Principal            |
| **Category**         | Engineering, Design, Product, Marketing, Sales, … (10)    |
| **Minimum salary**   | 50k+, 80k+, 100k+, 150k+                                   |

- Selecting a job-type/experience option again **deselects** it (toggle behaviour).
- A **Clear all** action resets every filter.
- On mobile, the sidebar collapses behind a **Show filters** button.
- The results header shows a live match count and reflects the query (e.g. _Results for "design"_).
- An informative **empty state** appears when nothing matches, with a one-click clear.

**Under the hood:** `/jobs` is a Server Component that `await`s `searchParams` (a Promise in Next.js 16) and calls `getJobs(filters)`. The `FiltersSidebar` + `JobFilters` client components manipulate the URL via `useRouter`/`useSearchParams`; changing any filter resets pagination to page 1.

---

## 5. Sorting & pagination

- **Sort** (top-right of results): _Newest first_ (default, featured jobs float up), _Oldest first_, _Highest salary_.
- **Pagination**: 8 jobs per page, numbered controls plus Previous/Next. All active filters are preserved across pages.

**Under the hood:** `buildOrderBy()` maps the sort option to a Prisma `orderBy`; `getJobs()` returns `{ jobs, total, page, totalPages }`. The `Pagination` component reconstructs hrefs from the current filters.

---

## 6. Job detail page

**Route:** `/jobs/[id]`

A two-column layout:

- **Left (content):** company avatar, title, company (linked to website when provided) and location, a badge row (type, remote, experience, category, salary, posted-time), then sections for **About the role**, **Requirements** (checklist), **Benefits & perks**, and **Skills**.
- **Right (sticky sidebar):** the **Apply now** card and a **Save** button.

Line breaks in the description are preserved. Requirements/benefits render as check-marked lists. If the job is `CLOSED`, the apply form is replaced with a notice.

**Under the hood:** Server Component calling `getJob(id)`; unknown IDs call `notFound()` → the custom 404 page. `generateMetadata` produces per-job `<title>`/description for SEO and link previews.

---

## 7. Applying to a job

**Where:** the Apply card on any open job.

Fields: **Full name\***, **Email\***, Phone, Resume/portfolio link, LinkedIn, Cover letter. (`*` = required.)

- **Client + server validation.** The form posts JSON to `POST /api/jobs/[id]/apply`; the server validates with Zod and returns field-level errors (HTTP 422) rendered inline.
- **Success state.** On success the form is replaced with a friendly confirmation — no page reload.
- **Guard rails.** Applying to a closed job returns HTTP 409; invalid links/emails are rejected with clear messages.

**Under the hood:** `ApplyForm` (client) manages `idle | submitting | success` state; `applicationSchema` (`src/lib/validations.ts`) validates input; a row is written to the `Application` table linked to the job.

---

## 8. Saved jobs (bookmarks)

**Where:** the bookmark button on job cards and detail pages; the **Saved** page at `/saved`.

- Tap the bookmark to save/unsave a job. The **navbar badge count updates instantly** everywhere on the page.
- The **Saved** page lists all bookmarked jobs (fetched fresh from the API), with a helpful empty state.
- Bookmarks are stored **per-device** in `localStorage` — no account needed.

**Under the hood:** `useSavedJobs` (`src/lib/useSavedJobs.ts`) uses React's `useSyncExternalStore` over `localStorage`, with a custom window event so every mounted instance (cards, badge, saved page) stays in sync without prop-drilling.

---

## 9. Posting a job

**Route:** `/post-job`

A grouped, multi-section form:

1. **Role details** — title, company, location, job type, experience level, category, remote toggle.
2. **Compensation** — min/max salary, currency (USD/EUR/GBP/INR). Optional.
3. **Description** — rich description, plus requirements/benefits (one per line) and skills/tags (comma-separated).
4. **Company & application** — website, logo URL, application email, and a "feature on homepage" toggle.

- **Smart parsing:** requirements/benefits accept newline- or comma-separated text and are stored as arrays.
- **Validation:** server-side Zod validation (e.g. title length, valid URLs/emails, max salary ≥ min salary) with inline error messages.
- On success you're **redirected to the new live job page**.

**Under the hood:** `PostJobForm` (client) posts to `POST /api/jobs`; `createJobSchema` validates and coerces input; the job is created with status `PUBLISHED` and appears in search immediately.

---

## 10. Employer dashboard

**Route:** `/employer`

A management table of **all listings** (any status) showing:

- Role + company
- Job type
- **Status** badge (published / draft / closed)
- **Application count** (links to the applications view)
- Posted time
- Actions: **View** applications, **Delete**

A summary line reports total listings and total applications across them. **Delete** asks for confirmation, calls `DELETE /api/jobs/[id]`, and the table refreshes (applications cascade-delete with the job).

**Under the hood:** Server Component using `getEmployerJobs()` (includes `_count.applications`); `DeleteJobButton` (client) performs the delete and calls `router.refresh()`.

---

## 11. Reviewing applications

**Route:** `/employer/[id]`

Shows the job header and every application received, newest first:

- Applicant name, **clickable email** (`mailto:`), and phone
- **Resume/portfolio** and **LinkedIn** links (open in a new tab)
- The cover letter, if provided
- Relative submission time

An empty state prompts sharing the listing when there are no applications yet.

**Under the hood:** `getJobWithApplications(id)` returns the job with its ordered `applications` relation.

---

## 12. System & UX details

- **Responsive** across mobile, tablet, and desktop (Tailwind breakpoints).
- **Accessibility:** semantic landmarks, labelled form fields (`htmlFor`/`id`), `aria-pressed` on toggles, `aria-current` on pagination, focus-visible rings, and descriptive `aria-label`s.
- **Loading states:** `/jobs` has a skeleton (`loading.tsx`) shown during navigation.
- **Error handling:** custom `not-found.tsx`; API routes return typed JSON errors with correct status codes (400/404/409/422).
- **SEO:** per-page metadata and a title template (`%s · WorkWave`).
- **Performance:** a single reused `PrismaClient`, indexed queries, parallelized reads (`Promise.all`), and Server Components that fetch directly (no client round-trips for reads).
- **Consistent design system:** button/input/card primitives defined once as Tailwind v4 `@utility` classes.

---

## 13. Data model

Two tables (see `prisma/schema.prisma`):

**Job**
: `id`, `title`, `company`, `companyLogo?`, `companyWebsite?`, `location`, `type` (enum), `category`, `experienceLevel` (enum), `remote`, `salaryMin?`, `salaryMax?`, `currency`, `description`, `requirements[]`, `benefits[]`, `tags[]`, `applyEmail?`, `featured`, `status` (enum), `postedAt`, `updatedAt`, and a one-to-many relation to applications. Indexed on `(status, postedAt)`, `category`, and `type`.

**Application**
: `id`, `jobId` (FK, cascade delete), `name`, `email`, `phone?`, `resumeUrl?`, `linkedinUrl?`, `coverLetter?`, `createdAt`. Indexed on `jobId`.

**Enums:** `JobType`, `ExperienceLevel`, `JobStatus`.

ATS tables:

**AtsCriterion**
: `id`, `key` (unique, engine dispatch key), `label`, `description`, `weight`, `enabled`, `order`. Admin-editable scoring dimensions.

**AtsSkill**
: `id`, `name`, `category`, `aliases[]`, `weight`. Unique on `(name, category)`. The skills/keyword dictionary.

**AtsCheck**
: `id`, `candidateName?`, `candidateEmail?`, `resumeFileName`, `jobId?`, `jobTitle?`, `hasJobDescription`, `overallScore`, `rating`, `breakdown` (JSON), `matchedKeywords[]`, `missingKeywords[]`, `wordCount`, `textPreview?`, `createdAt`. A stored report.

---

## 14. ATS Resume Score Checker

**Route:** `/ats` (public, no account required)

An Applicant Tracking System (ATS) simulator that tells candidates how their
resume is likely to be parsed and ranked — useful for everyone from a first-time
fresher to a 20-year veteran.

### How a candidate uses it

1. **Upload a resume** — PDF, DOCX, or TXT (drag-and-drop or click, max 5 MB).
2. **Choose a target (optional):**
   - **Pick a listed job** — the dropdown is populated live from the job board.
   - **Paste a job description** — free-form text.
   - **General check** — no job; scores general ATS-friendliness only.
3. **Add your name/email (optional)** — attaches the report to a candidate for the admin view.
4. **Get an instant report:**
   - An **animated 0–100 score gauge** with a rating band (Excellent / Good / Fair / Needs work).
   - A **keyword match** panel — terms extracted from the job description, split into *matched* and *missing* chips.
   - A **weighted per-criterion breakdown**, each with a score bar, an explanation, and prioritised suggestions.
   - Extracted **contact info** (email, phone, links) and **word count**.

Everything in the report is rendered from the backend response — no criteria,
weights, or copy are hard-coded in the frontend.

### How the score is computed (accuracy)

Text is extracted with **`unpdf`** (a serverless pdf.js build) for PDFs and
**`mammoth`** for DOCX. Scoring uses the **`natural`** NLP library (tokenisation,
Porter stemming, TF-IDF, and Jaro-Winkler fuzzy matching). The default criteria:

| Criterion | Default weight | What it measures |
| --------- | -------------- | ---------------- |
| **Job description match** | 30 | TF-IDF keywords from the JD found in the resume (stemmed + fuzzy). Skipped, with weights renormalised, when no JD is given. |
| **Skills coverage** | 20 | Recognised skills from the managed dictionary (name + aliases), scored against a fair target so freshers and seniors are both graded sensibly. |
| **Resume sections** | 15 | Presence of standard, clearly-titled sections (experience, education, skills, summary, projects). |
| **Action verbs & impact** | 12 | Variety of strong action verbs and quantified achievements (numbers, %, $). |
| **Contact information** | 10 | Email, phone, and a LinkedIn/portfolio link. |
| **ATS formatting** | 8 | Length, bullet usage, dates, and absence of parser-breaking glyphs. |
| **Readability & length** | 5 | Word count band and average sentence length. |

The overall score is a **weighted average over the applicable enabled criteria**,
with weights renormalised at run time. Every check is stored so admins can review it.

> **Privacy:** the uploaded file itself is never stored — only the resulting score,
> breakdown, and a short extracted-text preview.

---

## 15. Admin panel

**Route:** `/admin` (password-protected)

The admin controls *everything that drives the ATS score* — the request was that
the admin handles every action and users simply consume the result. Access is
gated by Next.js **middleware**: unauthenticated visits to `/admin/*` redirect to
`/admin/login`, and `/api/admin/*` returns `401`.

### Authentication

Sign in at `/admin/login` with `ADMIN_PASSWORD`. The server verifies it and issues
a signed **JWT session cookie** (via `jose`, `httpOnly`, 12-hour expiry). Sign-out
clears it.

### What the admin can manage

- **Overview** (`/admin`) — resumes analysed, average score, active-criteria count,
  dictionary size, and the most recent reports.
- **Scoring criteria** (`/admin/ats/criteria`) — edit each criterion's **weight**,
  **enable/disable** it, and edit its **label/description**. A live indicator shows
  each criterion's effective share of the total. Changes apply to the very next check.
- **Skills dictionary** (`/admin/ats/skills`) — add/edit/delete skills per category
  and give each **aliases** (e.g. "JavaScript" → "js") so the matcher catches variants.
- **Candidate reports** (`/admin/ats/reports`) — browse every stored check (paginated),
  open a full breakdown, view the extracted-text preview, and delete reports.

Because scoring reads these DB-backed rows at run time, the admin reshapes the
entire ATS algorithm **without a code change or redeploy**.

---

## Roadmap

Features a production version would add (intentionally out of scope for this demo):

- **Authentication & roles** — employer accounts, candidate profiles, ownership checks on the dashboard and applications.
- **File uploads** — resume upload (e.g. Vercel Blob / S3) instead of a link.
- **Email notifications** — confirmations to candidates, new-application alerts to employers.
- **Full-text search** — Postgres `tsvector` or a search service for ranked relevance.
- **Job editing UI** — the `PATCH /api/jobs/[id]` endpoint exists; a matching edit form would complete the loop.
- **Analytics** — per-listing views and apply-conversion tracking.
- **Rate limiting & spam protection** on public POST endpoints.
