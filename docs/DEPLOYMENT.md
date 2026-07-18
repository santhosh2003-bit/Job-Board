# WorkWave — Deployment & CI/CD Guide

This guide takes you from a local project to a live site on Vercel, deployed automatically by a GitHub Actions pipeline. It has five parts:

1. [Provision a PostgreSQL database](#1-provision-a-postgresql-database)
2. [Push the code to GitHub](#2-push-the-code-to-github)
3. [Create the Vercel project & link it](#3-create-the-vercel-project--link-it)
4. [Configure the CI/CD pipeline secrets](#4-configure-the-cicd-pipeline-secrets)
5. [Deploy & verify](#5-deploy--verify)

> **How the pipeline works.** `.github/workflows/ci-cd.yml` runs on every push and PR. It first runs a **quality gate** (lint → typecheck → build). If that passes, a **pull request** produces a **Preview** deployment (URL commented on the PR) and a push to **`main`** produces a **Production** deployment — both via the Vercel CLI.

---

## 1. Provision a PostgreSQL database

You need a Postgres database reachable from Vercel. **[Neon](https://neon.tech)** is recommended (free serverless tier):

1. Create a Neon project → copy the **connection string** (looks like `postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require`).
2. Keep it handy — you'll add it to both Vercel and your local `.env`.

> Alternatives that work identically: **Vercel Postgres**, **Supabase**, or any managed Postgres. If you use Vercel Postgres, it auto-injects `DATABASE_URL` (or `POSTGRES_URL`) into the project.

### Create the schema and seed it

From your machine, point `.env` at the database and run:

```bash
cp .env.example .env          # then paste your DATABASE_URL
npm install
npm run db:push               # create tables
npm run db:seed               # optional: insert 10 demo jobs
```

This provisions the tables once. (You could also run these against the production DB from CI, but doing it once locally keeps the pipeline simple.)

---

## 2. Push the code to GitHub

From the project root:

```bash
git init
git add .
git commit -m "Initial commit: WorkWave job board"
git branch -M main
```

Create the repository and push. With the **GitHub CLI** (`gh`):

```bash
gh repo create workwave-job-board --public --source=. --remote=origin --push
```

Or manually: create an empty repo on github.com, then:

```bash
git remote add origin https://github.com/<you>/workwave-job-board.git
git push -u origin main
```

> `.gitignore` already excludes `.env`, `node_modules`, `.next`, and the generated Prisma client. Only `.env.example` is committed.

---

## 3. Create the Vercel project & link it

Install the CLI and link the project (this creates `.vercel/project.json`, which contains the IDs the pipeline needs):

```bash
npm i -g vercel
vercel login
vercel link          # choose/create the project; run from the repo root
```

### Add the database URL to Vercel

Add `DATABASE_URL` as an environment variable for **all** environments (Production, Preview, Development):

```bash
vercel env add DATABASE_URL production
vercel env add DATABASE_URL preview
vercel env add DATABASE_URL development
```

…or add it in the dashboard: **Project → Settings → Environment Variables**. Paste the same connection string from step 1.

> The build itself doesn't need the database (pages are rendered on demand), but the **running** app does — so this variable is required for the deployed site to work.

### Add the admin panel secrets

The ATS admin panel (`/admin`) needs two more variables for all environments:

```bash
vercel env add ADMIN_PASSWORD production      # your chosen admin password
vercel env add ADMIN_JWT_SECRET production    # a long random string
# repeat for preview / development, or set them in the dashboard
```

- **`ADMIN_PASSWORD`** — the password used to sign in at `/admin/login`. **Do not** ship the local default (`admin123`).
- **`ADMIN_JWT_SECRET`** — used to sign admin session cookies. Generate a long random value, e.g. `openssl rand -base64 32`.

---

## 4. Configure the CI/CD pipeline secrets

The GitHub Actions workflow deploys with the Vercel CLI, which needs three secrets.

**Get the values:**

- **`VERCEL_TOKEN`** — create at <https://vercel.com/account/tokens>.
- **`VERCEL_ORG_ID`** and **`VERCEL_PROJECT_ID`** — open `.vercel/project.json` (created by `vercel link`); copy `orgId` and `projectId`.

**Add them to GitHub:** repo → **Settings → Secrets and variables → Actions → New repository secret**. Create:

| Secret name         | Value                                   |
| ------------------- | --------------------------------------- |
| `VERCEL_TOKEN`      | your Vercel account token               |
| `VERCEL_ORG_ID`     | `orgId` from `.vercel/project.json`     |
| `VERCEL_PROJECT_ID` | `projectId` from `.vercel/project.json` |

> If you use GitHub **Environments** (`production`, `preview`) for approvals, you can scope these secrets to those environments instead — the workflow already declares both environments.

### Avoid double deploys (optional but recommended)

If you connected the repo to Vercel's **native Git integration**, Vercel will also auto-deploy on push, duplicating this pipeline. Pick one:

- **Keep the GitHub Actions pipeline** (recommended for this assessment): in Vercel **Project → Settings → Git**, disable "Automatically deploy" / connected Git, so deploys only happen through Actions.
- **Or** delete `.github/workflows/ci-cd.yml` and let Vercel's integration deploy. (You'd lose the explicit lint/typecheck gate.)

---

## 5. Deploy & verify

1. Push to `main` (or merge a PR). Watch **GitHub → Actions**:
   - `Lint · Typecheck · Build` runs first.
   - On success, `Deploy Production` runs and prints the deployment URL.
2. Open the production URL — the home page should show live stats and jobs.
3. Open a pull request to see a **Preview** deployment URL posted as a comment.

### Post-deploy smoke test

```bash
# replace with your deployment origin
curl https://your-app.vercel.app/api/jobs?pageSize=1
```

You should get a JSON payload with a `jobs` array.

---

## Troubleshooting

| Symptom                                             | Fix                                                                                         |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Build fails on `prisma generate`                    | Ensure `postinstall` runs; Vercel uses `npm install` which triggers it. Node 20+ required.  |
| App loads but data pages error / 500                | `DATABASE_URL` is missing or wrong in Vercel env vars, or the schema wasn't pushed.          |
| `vercel pull` fails in CI                           | Check `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` secrets are set correctly.        |
| Two deployments per push                            | Disable Vercel's native Git auto-deploy (see step 4) or remove the Actions workflow.         |
| Empty job list in production                        | Run `npm run db:seed` against the production `DATABASE_URL`, or post a job via `/post-job`.   |
| `sslmode` errors connecting to Neon/Supabase        | Append `?sslmode=verify-full` to the connection string (managed providers present trusted certs). |
| `pg` warning: _SSL modes 'require'/'prefer' treated as 'verify-full'_ | Harmless deprecation warning. Switch `sslmode=require` → `sslmode=verify-full` in `DATABASE_URL` to silence it (same secure behavior). Use `sslmode=disable` for local no-SSL Postgres. |

---

## Reference: pipeline stages

```
push / PR
   │
   ▼
┌──────────────────────────┐
│ quality                  │  npm ci → prisma generate → prisma validate
│ (lint · typecheck · build)│  → lint → typecheck → build
└─────────────┬────────────┘
              │ (passes)
      ┌───────┴────────┐
      ▼                ▼
 pull_request      push to main
      │                │
      ▼                ▼
 Deploy Preview   Deploy Production
 (vercel deploy)  (vercel deploy --prod)
 comments URL
```
