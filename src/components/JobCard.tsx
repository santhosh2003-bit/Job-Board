import Link from "next/link";
import type { Job } from "@/generated/prisma";
import { Badge } from "@/components/Badge";
import { CompanyAvatar } from "@/components/CompanyAvatar";
import { SaveButton } from "@/components/SaveButton";
import { formatSalary, timeAgo } from "@/lib/format";
import { jobTypeLabel } from "@/lib/constants";

export function JobCard({ job }: { job: Job }) {
  const salary = formatSalary(job.salaryMin, job.salaryMax, job.currency);

  return (
    <div className="card group relative p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start gap-4">
        <CompanyAvatar company={job.company} logo={job.companyLogo} />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-slate-900">
                <Link
                  href={`/jobs/${job.id}`}
                  className="after:absolute after:inset-0"
                >
                  {job.title}
                </Link>
              </h3>
              <p className="truncate text-sm text-slate-600">
                {job.company} · {job.location}
              </p>
            </div>
            {job.featured && <Badge variant="amber">Featured</Badge>}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant="brand">{jobTypeLabel(job.type)}</Badge>
            {job.remote && <Badge variant="green">Remote</Badge>}
            <Badge variant="slate">{job.category}</Badge>
            {salary && (
              <span className="text-sm font-medium text-slate-700">{salary}</span>
            )}
          </div>

          {job.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {job.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-slate-50 px-2 py-0.5 text-xs text-slate-500 ring-1 ring-inset ring-slate-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-xs text-slate-400">{timeAgo(job.postedAt)}</span>
        {/* z-10 lifts the save button above the card-wide link overlay. */}
        <div className="relative z-10">
          <SaveButton jobId={job.id} />
        </div>
      </div>
    </div>
  );
}
