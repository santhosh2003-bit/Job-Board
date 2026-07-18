import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AtsChecker } from "@/components/ats/AtsChecker";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ATS Resume Score Checker",
  description:
    "Check how your resume performs against Applicant Tracking Systems. Get an accurate score, keyword match, and tailored suggestions.",
};

export default async function AtsPage() {
  const jobs = await prisma.job.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { postedAt: "desc" },
    select: { id: true, title: true, company: true },
    take: 100,
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <header className="mb-8 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-200">
          Free ATS analysis
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          ATS Resume Score Checker
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-600">
          See how Applicant Tracking Systems read your resume. Upload it, optionally
          match it to a role, and get an accurate score with clear, actionable fixes —
          whether you&apos;re a fresher or have 20 years of experience.
        </p>
      </header>

      <AtsChecker jobs={jobs} />
    </div>
  );
}
