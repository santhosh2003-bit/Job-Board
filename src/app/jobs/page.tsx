import type { Metadata } from "next";
import Link from "next/link";
import { getJobs } from "@/lib/jobs";
import { JobCard } from "@/components/JobCard";
import { FiltersSidebar } from "@/components/FiltersSidebar";
import { SortSelect } from "@/components/SortSelect";
import { Pagination } from "@/components/Pagination";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Browse jobs",
  description: "Search and filter open roles on WorkWave.",
};

type SearchParams = Record<string, string | undefined>;

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  const result = await getJobs({
    q: sp.q,
    type: sp.type,
    category: sp.category,
    experienceLevel: sp.experienceLevel,
    location: sp.location,
    remote: sp.remote === "true",
    minSalary: sp.minSalary ? Number(sp.minSalary) : undefined,
    sort: sp.sort as "newest" | "oldest" | "salary_high" | undefined,
    page: sp.page ? Number(sp.page) : 1,
  });

  const { jobs, total, page, totalPages } = result;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {sp.q ? `Results for “${sp.q}”` : "Browse jobs"}
        </h1>
        <p className="mt-1 text-slate-600">
          {total} {total === 1 ? "job" : "jobs"} found
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <FiltersSidebar />

        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Showing page {page} of {totalPages}
            </p>
            <SortSelect />
          </div>

          {jobs.length === 0 ? (
            <div className="card flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                  <path d="m20 20-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                No jobs match your filters
              </h3>
              <p className="mt-1 text-slate-500">
                Try broadening your search or clearing some filters.
              </p>
              <Link href="/jobs" className="btn-primary mt-5">
                Clear filters
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}

          <Pagination page={page} totalPages={totalPages} searchParams={sp} />
        </div>
      </div>
    </div>
  );
}
