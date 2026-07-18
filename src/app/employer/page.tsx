import type { Metadata } from "next";
import Link from "next/link";
import { getEmployerJobs } from "@/lib/jobs";
import { Badge } from "@/components/Badge";
import { DeleteJobButton } from "@/components/DeleteJobButton";
import { jobTypeLabel } from "@/lib/constants";
import { timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Employer dashboard",
  description: "Manage your job listings and review applications.",
};

export default async function EmployerPage() {
  const jobs = await getEmployerJobs();
  const totalApplications = jobs.reduce((n, j) => n + j._count.applications, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Employer dashboard
          </h1>
          <p className="mt-1 text-slate-600">
            {jobs.length} {jobs.length === 1 ? "listing" : "listings"} ·{" "}
            {totalApplications}{" "}
            {totalApplications === 1 ? "application" : "applications"}
          </p>
        </div>
        <Link href="/post-job" className="btn-primary">
          Post a job
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="card mt-8 flex flex-col items-center px-6 py-16 text-center">
          <h3 className="text-lg font-semibold text-slate-900">No listings yet</h3>
          <p className="mt-1 text-slate-500">
            Post your first job to start receiving applications.
          </p>
          <Link href="/post-job" className="btn-primary mt-5">
            Post a job
          </Link>
        </div>
      ) : (
        <div className="card mt-8 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Role</th>
                  <th className="px-5 py-3 font-semibold">Type</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Applications</th>
                  <th className="px-5 py-3 font-semibold">Posted</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <Link
                        href={`/jobs/${job.id}`}
                        className="font-medium text-slate-900 hover:text-indigo-600"
                      >
                        {job.title}
                      </Link>
                      <div className="text-xs text-slate-500">{job.company}</div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {jobTypeLabel(job.type)}
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        variant={
                          job.status === "PUBLISHED"
                            ? "green"
                            : job.status === "CLOSED"
                              ? "default"
                              : "amber"
                        }
                      >
                        {job.status.toLowerCase()}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/employer/${job.id}`}
                        className="font-medium text-indigo-600 hover:underline"
                      >
                        {job._count.applications}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      {timeAgo(job.postedAt)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-4">
                        <Link
                          href={`/employer/${job.id}`}
                          className="text-sm font-medium text-slate-600 hover:text-indigo-600"
                        >
                          View
                        </Link>
                        <DeleteJobButton jobId={job.id} jobTitle={job.title} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
