import Link from "next/link";
import { SavedCount } from "@/components/SavedCount";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-white">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3 13c3 3 6 3 9 0s6-3 9 0M3 8c3 3 6 3 9 0s6-3 9 0"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            WorkWave
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link href="/jobs" className="btn-ghost">
            Browse jobs
          </Link>
          <Link href="/ats" className="hidden btn-ghost sm:inline-flex">
            ATS checker
          </Link>
          <Link href="/employer" className="hidden btn-ghost sm:inline-flex">
            For employers
          </Link>
          <SavedCount />
          <Link href="/post-job" className="btn-primary">
            Post a job
          </Link>
        </nav>
      </div>
    </header>
  );
}
