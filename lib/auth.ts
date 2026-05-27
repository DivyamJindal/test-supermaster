import { cookies } from "next/headers";
import { createHmac } from "crypto";

const SESSION_COOKIE = "cal_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function secret() {
  const s = process.env.APP_SECRET;
  if (!s) throw new Error("APP_SECRET not set");
  return s;
}

function sign(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("hex");
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
  return sign(payload) === sig;
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
