import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-md bg-indigo-600 text-white">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M3 13c3 3 6 3 9 0s6-3 9 0M3 8c3 3 6 3 9 0s6-3 9 0"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <span className="font-bold text-slate-900">WorkWave</span>
            </div>
            <p className="mt-2 max-w-xs text-sm text-slate-500">
              A modern job board connecting great people with great teams.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link href="/jobs" className="text-slate-600 hover:text-indigo-600">
              Browse jobs
            </Link>
            <Link href="/ats" className="text-slate-600 hover:text-indigo-600">
              ATS checker
            </Link>
            <Link href="/post-job" className="text-slate-600 hover:text-indigo-600">
              Post a job
            </Link>
            <Link href="/employer" className="text-slate-600 hover:text-indigo-600">
              Employer dashboard
            </Link>
          </nav>
        </div>

        <p className="mt-8 border-t border-slate-100 pt-6 text-xs text-slate-400">
          © {new Date().getFullYear()} WorkWave. Built as a demo job board with
          Next.js, Prisma & Tailwind CSS.
        </p>
      </div>
    </footer>
  );
}
