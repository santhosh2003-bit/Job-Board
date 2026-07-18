import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

const updateSchema = z.object({
  weight: z.coerce.number().int().min(0).max(100).optional(),
  enabled: z.boolean().optional(),
  label: z.string().min(2).max(80).optional(),
  description: z.string().min(2).max(500).optional(),
});

/** PATCH /api/admin/ats/criteria/:id — update weight, enabled, label, description. */
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }
  const existing = await prisma.atsCriterion.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const criterion = await prisma.atsCriterion.update({ where: { id }, data: parsed.data });
  return NextResponse.json(criterion);
}
