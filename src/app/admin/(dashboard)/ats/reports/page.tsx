import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { timeAgo } from "@/lib/format";
import { DeleteReportButton } from "@/components/admin/DeleteReportButton";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

const ratingColor = (r: string) =>
  r === "Excellent" ? "text-emerald-600"
  : r === "Good" ? "text-indigo-600"
  : r === "Fair" ? "text-amber-600"
  : "text-rose-600";

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? 1));

  const [checks, total] = await Promise.all([
    prisma.atsCheck.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.atsCheck.count(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Candidate reports</h1>
      <p className="mt-1 text-slate-600">{total} resume checks recorded.</p>

      {checks.length === 0 ? (
        <div className="card mt-6 px-6 py-16 text-center text-slate-500">
          No reports yet.
        </div>
      ) : (
        <div className="card mt-6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Candidate</th>
                  <th className="px-5 py-3 font-semibold">Target job</th>
                  <th className="px-5 py-3 font-semibold">Score</th>
                  <th className="px-5 py-3 font-semibold">Rating</th>
                  <th className="px-5 py-3 font-semibold">When</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {checks.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <Link href={`/admin/ats/reports/${c.id}`} className="font-medium text-slate-900 hover:text-indigo-600">
                        {c.candidateName || c.resumeFileName}
                      </Link>
                      {c.candidateEmail && <div className="text-xs text-slate-500">{c.candidateEmail}</div>}
                    </td>
                    <td className="px-5 py-4 text-slate-600">{c.jobTitle ?? "— general —"}</td>
                    <td className="px-5 py-4 font-semibold text-slate-800">{c.overallScore}/100</td>
                    <td className={`px-5 py-4 font-medium ${ratingColor(c.rating)}`}>{c.rating}</td>
                    <td className="px-5 py-4 text-slate-500">{timeAgo(c.createdAt)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-4">
                        <Link href={`/admin/ats/reports/${c.id}`} className="text-sm font-medium text-slate-600 hover:text-indigo-600">
                          View
                        </Link>
                        <DeleteReportButton id={c.id} label={c.candidateName || c.resumeFileName} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/ats/reports?page=${p}`}
              className={`grid h-9 w-9 place-items-center rounded-lg text-sm font-medium ${
                p === page ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
