import { cookies } from "next/headers";
import { timingSafeEqual } from "crypto";
import { makeSessionToken, SESSION_COOKIE, MAX_AGE } from "@/lib/auth";

// In-memory rate limiter: max 10 failed attempts per IP per 15 minutes
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 10;
const failures = new Map<string, { count: number; resetAt: number }>();

function getIP(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = failures.get(ip);
  if (!entry || now > entry.resetAt) return false;
  return entry.count >= MAX_FAILURES;
}

function recordFailure(ip: string): void {
  const now = Date.now();
  const entry = failures.get(ip);
  if (!entry || now > entry.resetAt) {
    failures.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    entry.count += 1;
  }
}

function clearFailures(ip: string): void {
  failures.delete(ip);
}

function safePasscodeEqual(a: string, b: string): boolean {
  // Pad both to the same length so Buffer constructor doesn't reveal length info
  const maxLen = Math.max(a.length, b.length, 1);
  const bufA = Buffer.alloc(maxLen);
  const bufB = Buffer.alloc(maxLen);
  bufA.write(a);
  bufB.write(b);
  return timingSafeEqual(bufA, bufB);
}

export async function POST(req: Request) {
  const ip = getIP(req);

  if (isRateLimited(ip)) {
    return Response.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  const body = await req.json().catch(() => null) as { passcode?: unknown } | null;
  const passcode = typeof body?.passcode === "string" ? body.passcode : "";

  const expected = process.env.APP_PASSCODE;
  if (!expected) return Response.json({ error: "Not configured" }, { status: 500 });

  if (!safePasscodeEqual(passcode, expected)) {
    recordFailure(ip);
    return Response.json({ error: "Wrong passcode" }, { status: 401 });
  }

  clearFailures(ip);

  const token = makeSessionToken();
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE,
    path: "/",
  });

  return Response.json({ ok: true });
}

export async function DELETE() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  return Response.json({ ok: true });
}
