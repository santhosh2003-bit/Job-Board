"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Job } from "@/generated/prisma";
import { JobCard } from "@/components/JobCard";
import { useSavedJobs } from "@/lib/useSavedJobs";

export default function SavedPage() {
  const { saved } = useSavedJobs();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const results = await Promise.all(
        saved.map((id) =>
          fetch(`/api/jobs/${id}`).then((r) => (r.ok ? r.json() : null))
        )
      );
      if (!cancelled) {
        setJobs(results.filter(Boolean));
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [saved]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">
        Saved jobs
      </h1>
      <p className="mt-1 text-slate-600">
        {saved.length} {saved.length === 1 ? "job" : "jobs"} bookmarked on this
        device.
      </p>

      {loading && saved.length > 0 ? (
        <p className="mt-8 text-slate-500">Loading…</p>
      ) : jobs.length === 0 ? (
        <div className="card mt-8 flex flex-col items-center px-6 py-16 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">
            No saved jobs yet
          </h3>
          <p className="mt-1 text-slate-500">
            Tap the bookmark icon on any job to save it here for later.
          </p>
          <Link href="/jobs" className="btn-primary mt-5">
            Browse jobs
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-4">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
