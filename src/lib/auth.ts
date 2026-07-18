import { SignJWT, jwtVerify } from "jose";

export const ADMIN_COOKIE = "ww_admin";
const ISSUER = "workwave-ats";

function secretKey(): Uint8Array {
  const secret =
    process.env.ADMIN_JWT_SECRET ?? process.env.AUTH_SECRET ?? "dev-insecure-secret-change-me";
  return new TextEncoder().encode(secret);
}

/** The admin password to check against. Set ADMIN_PASSWORD in production. */
export function adminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? "admin123";
}

/** Issue a signed admin session token (valid 12h). Edge- and Node-compatible. */
export async function signAdminSession(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(ISSUER)
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(secretKey());
}

/** Verify an admin session token; returns true when valid. */
export async function verifyAdminSession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { issuer: ISSUER });
    return payload.role === "admin";
  } catch {
    return false;
  }
}
