import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const SESSION_COOKIE = "cal_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days in seconds

function secret() {
  const s = process.env.APP_SECRET;
  if (!s) throw new Error("APP_SECRET not set");
  return s;
}

function sign(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  // Reject immediately on length mismatch (no timing info leaks because
  // both are hex digests of the same algorithm — always 64 chars)
  const bufA = Buffer.from(a, "hex");
  const bufB = Buffer.from(b, "hex");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function makeSessionToken(): string {
  const payload = `auth:${Date.now()}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string): boolean {
  const dot = token.lastIndexOf(".");
  if (dot === -1) return false;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  // Constant-time HMAC check
  if (!safeEqual(sign(payload), sig)) return false;

  // Enforce expiry: payload is "auth:<ms timestamp>"
  const parts = payload.split(":");
  const ts = Number(parts[1]);
  if (!Number.isFinite(ts) || Date.now() - ts > MAX_AGE * 1000) return false;

  return true;
}

export async function requireAuth(): Promise<Response | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value ?? "";
  if (!verifySessionToken(token)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export { SESSION_COOKIE, MAX_AGE };
