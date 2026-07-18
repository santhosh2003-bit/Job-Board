import Link from "next/link";
import { SearchBar } from "@/components/SearchBar";
import { JobCard } from "@/components/JobCard";
import { getFeaturedJobs, getStats } from "@/lib/jobs";
import { CATEGORIES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, stats] = await Promise.all([getFeaturedJobs(3), getStats()]);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,#eef2ff_0%,transparent_70%)]" />
        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-200">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            {stats.totalJobs} open roles across {stats.totalCompanies} companies
          </span>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Find a job that <span className="text-indigo-600">works</span> for you
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            Browse curated roles from great teams. Filter by everything that
            matters and apply in seconds — no account required.
          </p>
          <div className="mx-auto mt-8 max-w-3xl">
            <SearchBar />
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-slate-500">
            <span>Popular:</span>
            {["Engineering", "Design", "Remote", "Product"].map((term) => (
              <Link
                key={term}
                href={`/jobs?${term === "Remote" ? "remote=true" : `q=${term}`}`}
                className="rounded-full px-2 py-0.5 text-indigo-600 hover:bg-indigo-50"
              >
                {term}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-3 divide-x divide-slate-200 px-4 sm:px-6">
          {[
            { label: "Open roles", value: stats.totalJobs },
            { label: "Companies", value: stats.totalCompanies },
            { label: "Remote jobs", value: stats.remoteJobs },
          ].map((s) => (
            <div key={s.label} className="py-6 text-center">
              <div className="text-2xl font-bold text-slate-900">{s.value}</div>
              <div className="text-sm text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured jobs */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Featured roles
              </h2>
              <p className="mt-1 text-slate-600">Hand-picked opportunities from top teams.</p>
            </div>
            <Link href="/jobs" className="btn-secondary hidden sm:inline-flex">
              View all jobs
            </Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </section>
      )}

      {/* Browse by category */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Browse by category
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {CATEGORIES.map((category) => (
              <Link
                key={category}
                href={`/jobs?category=${encodeURIComponent(category)}`}
                className="card px-4 py-5 text-center text-sm font-medium text-slate-700 transition-colors hover:border-indigo-300 hover:text-indigo-600"
              >
                {category}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ATS checker callout */}
      <section className="mx-auto max-w-6xl px-4 pt-14 sm:px-6">
        <div className="grid items-center gap-8 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-8 sm:grid-cols-2 sm:p-12">
          <div>
            <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-200">
              Free tool
            </span>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Will your resume beat the bots?
            </h2>
            <p className="mt-3 text-slate-600">
              Most applications are filtered by an Applicant Tracking System before a
              human ever reads them. Check your resume&apos;s ATS score, see exactly which
              keywords you&apos;re missing, and get tailored fixes — free, for freshers and
              seasoned pros alike.
            </p>
            <Link href="/ats" className="btn-primary mt-6">
              Check your ATS score
            </Link>
          </div>
          <ul className="space-y-3">
            {[
              "Upload a PDF, DOCX, or TXT resume",
              "Match against any job on the board",
              "Keyword match, skills coverage & formatting checks",
              "Actionable, prioritised suggestions",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-slate-700">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0 text-indigo-600" aria-hidden="true">
                  <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Employer CTA */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="overflow-hidden rounded-2xl bg-slate-900 px-8 py-12 text-center sm:px-16">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Hiring? Post a job in minutes.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-300">
            Reach thousands of qualified candidates. Your listing goes live
            instantly — and it&apos;s free on WorkWave.
          </p>
          <Link href="/post-job" className="btn mt-6 bg-white px-6 text-slate-900 hover:bg-slate-100">
            Post a job
          </Link>
        </div>
      </section>
    </div>
  );
}
