"use client";

import { ScoreGauge } from "@/components/ats/ScoreGauge";
import type { AtsReport as Report, CriterionResult } from "@/lib/ats/types";

const bandColor = (score: number) =>
  score >= 85 ? "bg-emerald-500" : score >= 70 ? "bg-indigo-500" : score >= 50 ? "bg-amber-500" : "bg-rose-500";

const ratingBadge = (rating: string) =>
  rating === "Excellent" ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
  : rating === "Good" ? "bg-indigo-50 text-indigo-700 ring-indigo-200"
  : rating === "Fair" ? "bg-amber-50 text-amber-700 ring-amber-200"
  : "bg-rose-50 text-rose-700 ring-rose-200";

export function AtsReportView({ report }: { report: Report }) {
  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="card p-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
          <ScoreGauge score={report.overallScore} />
          <div className="flex-1 text-center sm:text-left">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ring-1 ring-inset ${ratingBadge(report.rating)}`}>
              {report.rating}
            </span>
            <p className="mt-3 text-slate-700">{report.summary}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm text-slate-500 sm:justify-start">
              <span>{report.wordCount} words</span>
              {report.contact.email && <span>✉ {report.contact.email}</span>}
              {report.contact.phone && <span>☎ {report.contact.phone}</span>}
              {report.contact.links.length > 0 && <span>🔗 {report.contact.links.length} link(s)</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Keyword match */}
      {(report.matchedKeywords.length > 0 || report.missingKeywords.length > 0) && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-900">Keyword match</h3>
          <p className="mt-1 text-sm text-slate-500">
            Keywords extracted from the job description, compared against your resume.
          </p>
          {report.matchedKeywords.length > 0 && (
            <ChipGroup title="Matched" tone="green" items={report.matchedKeywords} />
          )}
          {report.missingKeywords.length > 0 && (
            <ChipGroup title="Missing — consider adding" tone="rose" items={report.missingKeywords} />
          )}
        </div>
      )}

      {/* Per-criterion breakdown */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-slate-900">Score breakdown</h3>
        <p className="mt-1 text-sm text-slate-500">
          Each dimension and its weight are configured by the WorkWave team and scored live.
        </p>
        <div className="mt-4 space-y-4">
          {report.criteria.map((c) => (
            <CriterionRow key={c.key} c={c} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CriterionRow({ c }: { c: CriterionResult }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-900">{c.label}</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
            weight {c.weight}
          </span>
          {!c.applicable && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-400">
              not applicable
            </span>
          )}
        </div>
        <span className="text-sm font-semibold text-slate-700">
          {c.applicable ? `${c.score}/100` : "—"}
        </span>
      </div>

      {c.applicable && (
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full ${bandColor(c.score)} transition-all`}
            style={{ width: `${c.score}%` }}
          />
        </div>
      )}

      {c.details && <p className="mt-2 text-sm text-slate-600">{c.details}</p>}

      {c.matched && c.matched.length > 0 && (
        <ChipGroup title="Found" tone="green" items={c.matched} small />
      )}
      {c.missing && c.missing.length > 0 && (
        <ChipGroup title="Missing" tone="rose" items={c.missing} small />
      )}

      {c.suggestions.length > 0 && (
        <ul className="mt-3 space-y-1">
          {c.suggestions.map((s, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
              <span className="mt-0.5 text-indigo-500">›</span>
              <span>{s}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ChipGroup({
  title,
  items,
  tone,
  small,
}: {
  title: string;
  items: string[];
  tone: "green" | "rose";
  small?: boolean;
}) {
  const cls =
    tone === "green"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : "bg-rose-50 text-rose-700 ring-rose-200";
  return (
    <div className={small ? "mt-2" : "mt-3"}>
      <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span key={item} className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${cls}`}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
