import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getJobs } from "@/lib/jobs";
import { createJobSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

/** GET /api/jobs — filtered, paginated job listings. */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const result = await getJobs({
    q: sp.get("q") ?? undefined,
    type: sp.get("type") ?? undefined,
    category: sp.get("category") ?? undefined,
    experienceLevel: sp.get("experienceLevel") ?? undefined,
    location: sp.get("location") ?? undefined,
    remote: sp.get("remote") === "true",
    minSalary: sp.get("minSalary") ? Number(sp.get("minSalary")) : undefined,
    sort: (sp.get("sort") as "newest" | "oldest" | "salary_high") ?? undefined,
    page: sp.get("page") ? Number(sp.get("page")) : undefined,
  });
  return NextResponse.json(result);
}

/** POST /api/jobs — create a new job posting. */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createJobSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const data = parsed.data;
  const job = await prisma.job.create({
    data: {
      ...data,
      companyLogo: data.companyLogo || null,
      companyWebsite: data.companyWebsite || null,
      applyEmail: data.applyEmail || null,
    },
  });

  return NextResponse.json(job, { status: 201 });
}
