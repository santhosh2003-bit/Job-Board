import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, adminPassword, signAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** POST /api/admin/login — exchange the admin password for a session cookie. */
export async function POST(req: NextRequest) {
  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!body.password || body.password !== adminPassword()) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const token = await signAdminSession();
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return res;
}
