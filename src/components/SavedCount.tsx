"use client";

import Link from "next/link";
import { useSavedJobs } from "@/lib/useSavedJobs";

/** Bookmark icon in the navbar with a live count of saved jobs. */
export function SavedCount() {
  const { saved } = useSavedJobs();

  return (
    <Link
      href="/saved"
      aria-label={`Saved jobs (${saved.length})`}
      className="relative inline-flex items-center rounded-lg p-2 text-slate-600 hover:bg-slate-100"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
      {saved.length > 0 && (
        <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white">
          {saved.length}
        </span>
      )}
    </Link>
  );
}
