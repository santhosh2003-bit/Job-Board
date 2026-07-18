import Link from "next/link";

/** URL-driven pagination that preserves all active filters. */
export function Pagination({
  page,
  totalPages,
  searchParams,
}: {
  page: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  const hrefFor = (p: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (v && k !== "page") params.set(k, v);
    }
    if (p > 1) params.set("page", String(p));
    return `/jobs${params.toString() ? `?${params}` : ""}`;
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      className="mt-8 flex items-center justify-center gap-1"
      aria-label="Pagination"
    >
      {page > 1 && (
        <Link href={hrefFor(page - 1)} className="btn-secondary px-3">
          Previous
        </Link>
      )}
      {pages.map((p) => (
        <Link
          key={p}
          href={hrefFor(p)}
          aria-current={p === page ? "page" : undefined}
          className={`grid h-10 w-10 place-items-center rounded-lg text-sm font-medium ${
            p === page
              ? "bg-indigo-600 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          {p}
        </Link>
      ))}
      {page < totalPages && (
        <Link href={hrefFor(page + 1)} className="btn-secondary px-3">
          Next
        </Link>
      )}
    </nav>
  );
}
