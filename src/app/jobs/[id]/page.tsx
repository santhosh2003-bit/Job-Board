import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getJob } from "@/lib/jobs";
import { Badge } from "@/components/Badge";
import { CompanyAvatar } from "@/components/CompanyAvatar";
import { ApplyForm } from "@/components/ApplyForm";
import { SaveButton } from "@/components/SaveButton";
import { formatSalary, timeAgo } from "@/lib/format";
import { jobTypeLabel, experienceLabel } from "@/lib/constants";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const job = await getJob(id);
  if (!job) return { title: "Job not found" };
  return {
    title: `${job.title} at ${job.company}`,
    description: job.description.slice(0, 155),
  };
}

export default async function JobDetailPage({ params }: Params) {
  const { id } = await params;
  const job = await getJob(id);
  if (!job) notFound();

  const salary = formatSalary(job.salaryMin, job.salaryMax, job.currency);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Link
        href="/jobs"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to jobs
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        {/* Main */}
        <article>
          <div className="card p-6">
            <div className="flex items-start gap-4">
              <CompanyAvatar company={job.company} logo={job.companyLogo} size={64} />
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  {job.title}
                </h1>
                <p className="mt-1 text-slate-600">
                  {job.companyWebsite ? (
                    <a
                      href={job.companyWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-indigo-600 hover:underline"
                    >
                      {job.company}
                    </a>
                  ) : (
                    <span className="font-medium">{job.company}</span>
                  )}{" "}
                  · {job.location}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <Badge variant="brand">{jobTypeLabel(job.type)}</Badge>
              {job.remote && <Badge variant="green">Remote</Badge>}
              <Badge variant="slate">{experienceLabel(job.experienceLevel)}</Badge>
              <Badge variant="slate">{job.category}</Badge>
              {salary && (
                <span className="ml-1 text-sm font-semibold text-slate-900">
                  {salary}
                </span>
              )}
              <span className="ml-auto text-xs text-slate-400">
                Posted {timeAgo(job.postedAt)}
              </span>
            </div>
          </div>

          <Section title="About the role">
            <p className="whitespace-pre-line leading-relaxed text-slate-700">
              {job.description}
            </p>
          </Section>

          {job.requirements.length > 0 && (
            <Section title="Requirements">
              <ul className="space-y-2">
                {job.requirements.map((r, i) => (
                  <ListItem key={i}>{r}</ListItem>
                ))}
              </ul>
            </Section>
          )}

          {job.benefits.length > 0 && (
            <Section title="Benefits & perks">
              <ul className="space-y-2">
                {job.benefits.map((b, i) => (
                  <ListItem key={i}>{b}</ListItem>
                ))}
              </ul>
            </Section>
          )}

          {job.tags.length > 0 && (
            <Section title="Skills">
              <div className="flex flex-wrap gap-2">
                {job.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg bg-slate-100 px-3 py-1 text-sm text-slate-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Section>
          )}
        </article>

        {/* Apply sidebar */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Apply now
              </h2>
              <SaveButton jobId={job.id} withLabel />
            </div>
            {job.status === "CLOSED" ? (
              <p className="rounded-lg bg-slate-100 px-3 py-4 text-center text-sm text-slate-500">
                This role is no longer accepting applications.
              </p>
            ) : (
              <ApplyForm jobId={job.id} jobTitle={job.title} />
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card mt-4 p-6">
      <h2 className="mb-3 text-lg font-semibold text-slate-900">{title}</h2>
      {children}
    </section>
  );
}

function ListItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 text-slate-700">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        className="mt-0.5 shrink-0 text-indigo-500"
        aria-hidden="true"
      >
        <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>{children}</span>
    </li>
  );
}
