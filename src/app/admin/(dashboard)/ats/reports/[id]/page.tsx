import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { timeAgo } from "@/lib/format";
import { DeleteReportButton } from "@/components/admin/DeleteReportButton";
import type { CriterionResult } from "@/lib/ats/types";

export const dynamic = "force-dynamic";

const bandColor = (score: number) =>
  score >= 85 ? "bg-emerald-500" : score >= 70 ? "bg-indigo-500" : score >= 50 ? "bg-amber-500" : "bg-rose-500";

export default async function AdminReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const check = await prisma.atsCheck.findUnique({ where: { id } });
  if (!check) notFound();

  const breakdown = (check.breakdown as unknown as CriterionResult[]) ?? [];

  return (
    <div>
      <Link href="/admin/ats/reports" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600">
        ‹ Back to reports
      </Link>

      <div className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {check.candidateName || check.resumeFileName}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {check.candidateEmail && <>{check.candidateEmail} · </>}
              {check.resumeFileName} · {timeAgo(check.createdAt)}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Target: {check.jobTitle ?? "general check"} · {check.wordCount} words
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-extrabold text-slate-900">{check.overallScore}<span className="text-lg text-slate-400">/100</span></div>
            <div className="text-sm font-medium text-slate-500">{check.rating}</div>
            <div className="mt-2"><DeleteReportButton id={check.id} label={check.candidateName || check.resumeFileName} redirectTo="/admin/ats/reports" /></div>
          </div>
        </div>
      </div>

      {(check.matchedKeywords.length > 0 || check.missingKeywords.length > 0) && (
        <div className="card mt-4 p-6">
          <h2 className="text-lg font-semibold text-slate-900">Keyword match</h2>
          {check.matchedKeywords.length > 0 && (
            <Chips title="Matched" tone="green" items={check.matchedKeywords} />
          )}
          {check.missingKeywords.length > 0 && (
            <Chips title="Missing" tone="rose" items={check.missingKeywords} />
          )}
        </div>
      )}

      <div className="card mt-4 p-6">
        <h2 className="text-lg font-semibold text-slate-900">Breakdown</h2>
        <div className="mt-4 space-y-4">
          {breakdown.map((c) => (
            <div key={c.key} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-900">{c.label}</span>
                <span className="text-sm font-semibold text-slate-700">
                  {c.applicable ? `${c.score}/100 · weight ${c.weight}` : "not applicable"}
                </span>
              </div>
              {c.applicable && (
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full ${bandColor(c.score)}`} style={{ width: `${c.score}%` }} />
                </div>
              )}
              {c.details && <p className="mt-2 text-sm text-slate-600">{c.details}</p>}
            </div>
          ))}
        </div>
      </div>

      {check.textPreview && (
        <div className="card mt-4 p-6">
          <h2 className="text-lg font-semibold text-slate-900">Extracted text (preview)</h2>
          <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-xs text-slate-600">
            {check.textPreview}
          </pre>
        </div>
      )}
    </div>
  );
}

function Chips({ title, items, tone }: { title: string; items: string[]; tone: "green" | "rose" }) {
  const cls = tone === "green" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-rose-50 text-rose-700 ring-rose-200";
  return (
    <div className="mt-3">
      <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((i) => (
          <span key={i} className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${cls}`}>{i}</span>
        ))}
      </div>
    </div>
  );
}
