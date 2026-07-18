import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

const stringList = z
  .union([z.array(z.string()), z.string()])
  .transform((v) => (Array.isArray(v) ? v : v.split(",")).map((s) => s.trim()).filter(Boolean))
  .optional();

const updateSchema = z.object({
  name: z.string().min(1).max(60).optional(),
  category: z.string().min(1).max(40).optional(),
  aliases: stringList,
  weight: z.coerce.number().int().min(1).max(10).optional(),
});

/** PATCH /api/admin/ats/skills/:id — edit a skill. */
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
  const existing = await prisma.atsSkill.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const skill = await prisma.atsSkill.update({ where: { id }, data: parsed.data });
  return NextResponse.json(skill);
}

/** DELETE /api/admin/ats/skills/:id — remove a skill from the dictionary. */
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const existing = await prisma.atsSkill.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.atsSkill.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
