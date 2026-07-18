import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/admin/ats/checks/:id — a single stored report with full breakdown. */
export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const check = await prisma.atsCheck.findUnique({ where: { id } });
  if (!check) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(check);
}

/** DELETE /api/admin/ats/checks/:id — delete a stored report. */
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const existing = await prisma.atsCheck.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.atsCheck.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
