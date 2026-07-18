import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [checkCount, avg, criteriaCount, enabledCount, skillCount, recent] =
    await Promise.all([
      prisma.atsCheck.count(),
      prisma.atsCheck.aggregate({ _avg: { overallScore: true } }),
      prisma.atsCriterion.count(),
      prisma.atsCriterion.count({ where: { enabled: true } }),
      prisma.atsSkill.count(),
      prisma.atsCheck.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true, candidateName: true, resumeFileName: true, overallScore: true,
          rating: true, createdAt: true,
        },
      }),
    ]);

  const stats = [
    { label: "Resumes analysed", value: checkCount, href: "/admin/ats/reports" },
    { label: "Average score", value: Math.round(avg._avg.overallScore ?? 0), href: "/admin/ats/reports" },
    { label: "Active criteria", value: `${enabledCount}/${criteriaCount}`, href: "/admin/ats/criteria" },
    { label: "Skills in dictionary", value: skillCount, href: "/admin/ats/skills" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Overview</h1>
      <p className="mt-1 text-slate-600">
        Everything that drives the ATS score is managed here.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card p-5 transition-shadow hover:shadow-md">
            <div className="text-3xl font-bold text-slate-900">{s.value}</div>
            <div className="mt-1 text-sm text-slate-500">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="card mt-8 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Recent reports</h2>
          <Link href="/admin/ats/reports" className="text-sm font-medium text-indigo-600 hover:underline">
            View all
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">
            No resumes analysed yet. Reports will appear here as candidates use the{" "}
            <Link href="/ats" className="text-indigo-600 hover:underline">ATS checker</Link>.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100">
            {recent.map((r) => (
              <li key={r.id} className="flex items-center justify-between py-3">
                <div className="min-w-0">
                  <Link href={`/admin/ats/reports/${r.id}`} className="font-medium text-slate-900 hover:text-indigo-600">
                    {r.candidateName || r.resumeFileName}
                  </Link>
                  <div className="text-xs text-slate-500">{timeAgo(r.createdAt)}</div>
                </div>
                <span className="text-sm font-semibold text-slate-700">{r.overallScore}/100</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
