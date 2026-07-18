import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { applicationSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** POST /api/jobs/:id/apply — submit an application for a job. */
export async function POST(req: NextRequest, { params }: Ctx) {
  const { id } = await params;

  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
  if (job.status === "CLOSED")
    return NextResponse.json(
      { error: "This job is no longer accepting applications" },
      { status: 409 }
    );

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = applicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const data = parsed.data;
  const application = await prisma.application.create({
    data: {
      jobId: id,
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      resumeUrl: data.resumeUrl || null,
      linkedinUrl: data.linkedinUrl || null,
      coverLetter: data.coverLetter || null,
    },
  });

  return NextResponse.json(
    { success: true, applicationId: application.id },
    { status: 201 }
  );
}
