import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** GET /api/admin/ats/criteria — all scoring criteria in display order. */
export async function GET() {
  const criteria = await prisma.atsCriterion.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json({ criteria });
}
