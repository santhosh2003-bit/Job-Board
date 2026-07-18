export default function JobsLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 h-8 w-48 animate-pulse rounded bg-slate-200" />
      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <div className="hidden h-96 animate-pulse rounded-xl bg-slate-200 lg:block" />
        <div className="grid gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card p-5">
              <div className="flex gap-4">
                <div className="h-12 w-12 animate-pulse rounded-lg bg-slate-200" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200" />
                  <div className="flex gap-2">
                    <div className="h-5 w-16 animate-pulse rounded-full bg-slate-200" />
                    <div className="h-5 w-16 animate-pulse rounded-full bg-slate-200" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
