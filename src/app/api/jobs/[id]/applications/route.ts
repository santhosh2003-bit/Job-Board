import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/**
 * GET /api/jobs/:id/applications — list applications received for a job.
 * In a production app this would sit behind employer authentication.
 */
export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  const applications = await prisma.application.findMany({
    where: { jobId: id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ applications });
}
