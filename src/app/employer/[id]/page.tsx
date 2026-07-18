import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getJobWithApplications } from "@/lib/jobs";
import { Badge } from "@/components/Badge";
import { jobTypeLabel } from "@/lib/constants";
import { timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const job = await getJobWithApplications(id);
  return { title: job ? `Applications · ${job.title}` : "Applications" };
}

export default async function EmployerJobPage({ params }: Params) {
  const { id } = await params;
  const job = await getJobWithApplications(id);
  if (!job) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link
        href="/employer"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to dashboard
      </Link>

      <div className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{job.title}</h1>
            <p className="mt-1 text-sm text-slate-600">
              {job.company} · {job.location}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="brand">{jobTypeLabel(job.type)}</Badge>
            <Link href={`/jobs/${job.id}`} className="btn-secondary">
              View listing
            </Link>
          </div>
        </div>
      </div>

      <h2 className="mt-8 text-lg font-semibold text-slate-900">
        Applications ({job.applications.length})
      </h2>

      {job.applications.length === 0 ? (
        <div className="card mt-4 px-6 py-12 text-center text-slate-500">
          No applications yet. Share the listing to start receiving candidates.
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {job.applications.map((app) => (
            <div key={app.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-slate-900">{app.name}</h3>
                  <a
                    href={`mailto:${app.email}`}
                    className="text-sm text-indigo-600 hover:underline"
                  >
                    {app.email}
                  </a>
                  {app.phone && (
                    <span className="ml-2 text-sm text-slate-500">
                      · {app.phone}
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400">
                  {timeAgo(app.createdAt)}
                </span>
              </div>

              <div className="mt-2 flex flex-wrap gap-3 text-sm">
                {app.resumeUrl && (
                  <a
                    href={app.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-indigo-600 hover:underline"
                  >
                    Resume / portfolio ↗
                  </a>
                )}
                {app.linkedinUrl && (
                  <a
                    href={app.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-indigo-600 hover:underline"
                  >
                    LinkedIn ↗
                  </a>
                )}
              </div>

              {app.coverLetter && (
                <p className="mt-3 whitespace-pre-line rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                  {app.coverLetter}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
