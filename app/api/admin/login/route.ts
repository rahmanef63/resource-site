import { NextRequest, NextResponse } from "next/server";
import { checkLogin, makeSession, SESSION_COOKIE } from "@/lib/admin-auth";
import { extractIp, rateLimit, resetRateLimit } from "@/lib/rate-limit-memory";

const RL = { limit: 5, windowMs: 15 * 60 * 1000 }; // 5 attempts per 15 minutes

export async function POST(req: NextRequest) {
  const ip = extractIp(req);
  const gate = rateLimit(`admin-login:${ip}`, RL);
  if (!gate.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(gate.retryAfterSec) },
      },
    );
  }

  let email = "";
  let password = "";
  try {
    const body = await req.json();
    email = String(body?.email ?? "");
    password = String(body?.password ?? "");
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  if (!email || !password) {
    return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
  }
  let ok = false;
  try {
    ok = checkLogin(email, password);
  } catch {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }
  if (!ok) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  resetRateLimit(`admin-login:${ip}`);
  const token = makeSession(email);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  return res;
}
