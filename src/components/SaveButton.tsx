"use client";

import { useSavedJobs } from "@/lib/useSavedJobs";

export function SaveButton({
  jobId,
  withLabel = false,
}: {
  jobId: string;
  withLabel?: boolean;
}) {
  const { isSaved, toggle } = useSavedJobs();
  const saved = isSaved(jobId);

  return (
    <button
      type="button"
      onClick={() => toggle(jobId)}
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved jobs" : "Save job"}
      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors ${
        saved
          ? "text-indigo-600 hover:bg-indigo-50"
          : "text-slate-500 hover:bg-slate-100"
      }`}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
      {withLabel && (saved ? "Saved" : "Save")}
    </button>
  );
}
