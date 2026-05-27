import { cookies } from "next/headers";
import { makeSessionToken, SESSION_COOKIE, MAX_AGE } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null) as { passcode?: unknown } | null;
  const passcode = typeof body?.passcode === "string" ? body.passcode : "";

  const expected = process.env.APP_PASSCODE;
  if (!expected) return Response.json({ error: "Not configured" }, { status: 500 });
  if (passcode !== expected) {
    return Response.json({ error: "Wrong passcode" }, { status: 401 });
  }

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
