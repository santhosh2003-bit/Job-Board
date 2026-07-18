# WorkWave — API Reference

The job board exposes a small REST API implemented with Next.js Route Handlers under `src/app/api/`. All endpoints accept and return JSON. Responses use conventional HTTP status codes.

Base URL: your deployment origin (e.g. `https://your-app.vercel.app`) or `http://localhost:3000` in development.

## Conventions

- Request bodies are `application/json`.
- Validation errors return **422** with a `{ error, issues }` shape, where `issues` maps field names to arrays of messages.
- Malformed JSON returns **400**. Missing resources return **404**.

---

## Jobs

### `GET /api/jobs`

List published jobs with filtering, sorting, and pagination.

**Query parameters** (all optional):

| Param             | Type    | Description                                             |
| ----------------- | ------- | ------------------------------------------------------ |
| `q`               | string  | Keyword — matches title, company, description, tags    |
| `location`        | string  | Substring match on location                            |
| `type`            | enum    | `FULL_TIME` `PART_TIME` `CONTRACT` `INTERNSHIP` `TEMPORARY` |
| `experienceLevel` | enum    | `INTERN` `ENTRY` `MID` `SENIOR` `LEAD`                 |
| `category`        | string  | One of the known categories                            |
| `remote`          | boolean | `true` to only return remote roles                     |
| `minSalary`       | number  | Minimum of the job's `salaryMax`                        |
| `sort`            | enum    | `newest` (default) `oldest` `salary_high`              |
| `page`            | number  | 1-based page number (8 per page)                       |

**200 Response**

```json
{
  "jobs": [ { "id": "…", "title": "Senior Frontend Engineer", "...": "…" } ],
  "total": 11,
  "page": 1,
  "pageSize": 8,
  "totalPages": 2
}
```

**Example**

```bash
curl "http://localhost:3000/api/jobs?q=engineer&remote=true&sort=salary_high"
```

---

### `POST /api/jobs`

Create a new job posting.

**Body**

| Field             | Type       | Required | Notes                                     |
| ----------------- | ---------- | -------- | ----------------------------------------- |
| `title`           | string     | ✅       | 3–120 chars                               |
| `company`         | string     | ✅       | 2–120 chars                               |
| `location`        | string     | ✅       |                                           |
| `type`            | enum       | ✅       | see JobType                               |
| `category`        | string     | ✅       |                                           |
| `experienceLevel` | enum       | ✅       | see ExperienceLevel                       |
| `description`     | string     | ✅       | ≥ 30 chars                                |
| `remote`          | boolean    |          | default `false`                           |
| `salaryMin`       | number     |          |                                           |
| `salaryMax`       | number     |          | must be ≥ `salaryMin`                     |
| `currency`        | string     |          | default `USD`                             |
| `requirements`    | string[] \| string |  | array, or newline/comma-separated string  |
| `benefits`        | string[] \| string |  | same                                      |
| `tags`            | string[] \| string |  | same                                      |
| `companyWebsite`  | string     |          | valid URL                                 |
| `companyLogo`     | string     |          | valid URL                                 |
| `applyEmail`      | string     |          | valid email                               |
| `featured`        | boolean    |          | default `false`                           |

**201 Response:** the created job object.
**422 Response:** `{ "error": "Validation failed", "issues": { "title": ["Title must be at least 3 characters"] } }`

**Example**

```bash
curl -X POST http://localhost:3000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Backend Engineer",
    "company": "Acme",
    "location": "Remote",
    "type": "FULL_TIME",
    "category": "Engineering",
    "experienceLevel": "MID",
    "description": "Build and operate our core services and APIs.",
    "requirements": "3+ years Go\nDistributed systems",
    "tags": "Go, Postgres"
  }'
```

---

### `GET /api/jobs/:id`

Fetch a single job including its application count.

- **200:** the job object with `_count.applications`.
- **404:** `{ "error": "Job not found" }`.

---

### `PATCH /api/jobs/:id`

Partially update a job. Accepts any subset of the `POST` body fields (all optional). Same validation rules apply.

- **200:** the updated job.
- **404 / 422** as above.

---

### `DELETE /api/jobs/:id`

Delete a job. Its applications are removed via cascade.

- **200:** `{ "success": true }`.
- **404:** if the job doesn't exist.

---

## Applications

### `POST /api/jobs/:id/apply`

Submit an application for a job.

**Body**

| Field         | Type   | Required | Notes                 |
| ------------- | ------ | -------- | --------------------- |
| `name`        | string | ✅       | 2–120 chars           |
| `email`       | string | ✅       | valid email           |
| `phone`       | string |          |                       |
| `resumeUrl`   | string |          | valid URL             |
| `linkedinUrl` | string |          | valid URL             |
| `coverLetter` | string |          | ≤ 5000 chars          |

- **201:** `{ "success": true, "applicationId": "…" }`.
- **404:** job not found.
- **409:** the job is `CLOSED` and not accepting applications.
- **422:** validation failed (field-level `issues`).

**Example**

```bash
curl -X POST http://localhost:3000/api/jobs/JOB_ID/apply \
  -H "Content-Type: application/json" \
  -d '{ "name": "Ada Lovelace", "email": "ada@example.com", "coverLetter": "Excited to apply!" }'
```

---

### `GET /api/jobs/:id/applications`

List applications received for a job, newest first.

- **200:** `{ "applications": [ { "id": "…", "name": "…", "email": "…", "...": "…" } ] }`.
- **404:** job not found.

> ⚠️ In this demo this endpoint is unauthenticated. In production it would require employer authentication and ownership checks.

---

## ATS Resume Score Checker

### `POST /api/ats/check`

Analyse an uploaded resume and return an ATS report. Accepts **`multipart/form-data`**.

**Form fields**

| Field             | Type   | Required | Notes                                              |
| ----------------- | ------ | -------- | -------------------------------------------------- |
| `resume`          | file   | ✅       | PDF, DOCX, or TXT. Max 5 MB.                        |
| `jobId`           | string |          | Match against a listed job (uses its description).  |
| `jobDescription`  | string |          | Match against pasted JD text (ignored if `jobId`).  |
| `candidateName`   | string |          | Attaches the report to a candidate.                 |
| `candidateEmail`  | string |          | Same.                                               |

**200 Response** (shape)

```json
{
  "overallScore": 77,
  "rating": "Good",
  "summary": "This resume is solid and ATS-friendly…",
  "wordCount": 162,
  "matchedKeywords": ["react", "typescript"],
  "missingKeywords": ["graphql"],
  "contact": { "email": "ada@example.com", "phone": "+1 555…", "links": ["linkedin.com/in/ada"] },
  "criteria": [
    { "key": "jd_match", "label": "Job description match", "weight": 30, "score": 52,
      "applicable": true, "details": "…", "suggestions": ["…"], "matched": ["…"], "missing": ["…"] }
  ]
}
```

**Errors:** `422` (no/invalid/oversized file, or unreadable/scanned PDF), `400` (not multipart).

**Example**

```bash
curl -X POST http://localhost:3000/api/ats/check \
  -F "resume=@resume.pdf;type=application/pdf" \
  -F "jobId=JOB_ID" -F "candidateName=Ada Lovelace"
```

---

## Admin API

All `/api/admin/*` routes except login/logout require a valid admin session cookie
(set by `POST /api/admin/login`). Requests without it receive **401** (enforced by
middleware).

### Auth

| Endpoint | Method | Body | Result |
| -------- | ------ | ---- | ------ |
| `/api/admin/login` | POST | `{ "password": "…" }` | Sets `httpOnly` session cookie; `401` on wrong password |
| `/api/admin/logout` | POST | — | Clears the session cookie |

### Criteria

| Endpoint | Method | Description |
| -------- | ------ | ----------- |
| `/api/admin/ats/criteria` | GET | List all scoring criteria |
| `/api/admin/ats/criteria/:id` | PATCH | Update `weight` (0–100), `enabled`, `label`, `description` |

### Skills dictionary

| Endpoint | Method | Description |
| -------- | ------ | ----------- |
| `/api/admin/ats/skills` | GET | List skills (optional `?category=`) |
| `/api/admin/ats/skills` | POST | Create `{ name, category, aliases?, weight? }` (`409` if duplicate) |
| `/api/admin/ats/skills/:id` | PATCH | Edit a skill |
| `/api/admin/ats/skills/:id` | DELETE | Remove a skill |

### Candidate reports

| Endpoint | Method | Description |
| -------- | ------ | ----------- |
| `/api/admin/ats/checks` | GET | Paginated list of stored reports + `averageScore` |
| `/api/admin/ats/checks/:id` | GET | A single report with full breakdown |
| `/api/admin/ats/checks/:id` | DELETE | Delete a report |

---

## Status codes summary

| Code | Meaning                                   |
| ---- | ----------------------------------------- |
| 200  | Success                                   |
| 201  | Created (job or application)              |
| 400  | Malformed JSON body                       |
| 404  | Resource not found                        |
| 409  | Conflict (applying to a closed job)       |
| 422  | Validation failed (`issues` field-level)  |
