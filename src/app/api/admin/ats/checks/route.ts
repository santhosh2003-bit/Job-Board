import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** GET /api/admin/ats/checks — paginated list of every stored ATS report. */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, Number(sp.get("page") ?? 1));
  const pageSize = 20;

  const [checks, total, aggregate] = await Promise.all([
    prisma.atsCheck.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true, candidateName: true, candidateEmail: true, resumeFileName: true,
        jobTitle: true, overallScore: true, rating: true, wordCount: true, createdAt: true,
      },
    }),
    prisma.atsCheck.count(),
    prisma.atsCheck.aggregate({ _avg: { overallScore: true } }),
  ]);

  return NextResponse.json({
    checks,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    averageScore: Math.round(aggregate._avg.overallScore ?? 0),
  });
}
