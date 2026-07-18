import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getJob } from "@/lib/jobs";
import { createJobSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/jobs/:id — single job with application count. */
export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const job = await getJob(id);
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
  return NextResponse.json(job);
}

/** PATCH /api/jobs/:id — update fields on a job posting. */
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const existing = await prisma.job.findUnique({ where: { id } });
  if (!existing)
    return NextResponse.json({ error: "Job not found" }, { status: 404 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Allow partial updates by making every field optional.
  const parsed = createJobSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const job = await prisma.job.update({ where: { id }, data: parsed.data });
  return NextResponse.json(job);
}

/** DELETE /api/jobs/:id — remove a job (and its applications, via cascade). */
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const existing = await prisma.job.findUnique({ where: { id } });
  if (!existing)
    return NextResponse.json({ error: "Job not found" }, { status: 404 });

  await prisma.job.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
