import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const stringList = z
  .union([z.array(z.string()), z.string()])
  .transform((v) => (Array.isArray(v) ? v : v.split(",")).map((s) => s.trim()).filter(Boolean))
  .optional();

const createSchema = z.object({
  name: z.string().min(1, "Name is required").max(60),
  category: z.string().min(1, "Category is required").max(40),
  aliases: stringList,
  weight: z.coerce.number().int().min(1).max(10).optional(),
});

/** GET /api/admin/ats/skills — full skills dictionary (optionally by category). */
export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category");
  const skills = await prisma.atsSkill.findMany({
    where: category ? { category } : undefined,
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });
  return NextResponse.json({ skills });
}

/** POST /api/admin/ats/skills — add a skill to the dictionary. */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }
  const { name, category, aliases, weight } = parsed.data;
  const exists = await prisma.atsSkill.findUnique({
    where: { name_category: { name, category } },
  });
  if (exists) {
    return NextResponse.json({ error: "That skill already exists in this category." }, { status: 409 });
  }
  const skill = await prisma.atsSkill.create({
    data: { name, category, aliases: aliases ?? [], weight: weight ?? 1 },
  });
  return NextResponse.json(skill, { status: 201 });
}
