import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { makeFunctionReference } from "convex/server";
import { checkLogin, makeSession, SESSION_COOKIE } from "@/lib/admin-auth";
import { extractIp, rateLimit } from "@/lib/rate-limit-memory";

const RL = { limit: 5, windowMs: 15 * 60 * 1000 }; // 5 attempts per 15 minutes

const consumeRef = makeFunctionReference<"mutation">(
  "features/rate-limit/mutation:consume",
);

/** Convex-backed limiter when a deployment is configured (replica-safe),
 *  else the in-memory bucket (single-instance dev/preview). Convex path
 *  fails OPEN — an outage must not lock admins out of login; note there
 *  is deliberately no reset-on-success: a correct guess shouldn't refund
 *  an attacker's budget, the row just expires at `resetAt`. */
async function gateLogin(ip: string): Promise<{ ok: boolean; retryAfterSec: number }> {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) {
    const g = rateLimit(`admin-login:${ip}`, RL);
    return g.ok
      ? { ok: true, retryAfterSec: 0 }
      : { ok: false, retryAfterSec: g.retryAfterSec };
  }
  try {
    const client = new ConvexHttpClient(url);
    const res = await client.mutation(consumeRef, {
      key: `admin-login:${ip}`,
      serverKey: process.env.RATE_LIMIT_SERVER_KEY,
    });
    return {
      ok: res.ok,
      retryAfterSec: Math.max(1, Math.ceil((res.resetAt - Date.now()) / 1000)),
    };
  } catch {
    // Fail open on Convex flap; memory bucket still applies per instance.
    const g = rateLimit(`admin-login:${ip}`, RL);
    return g.ok
      ? { ok: true, retryAfterSec: 0 }
      : { ok: false, retryAfterSec: g.retryAfterSec };
  }
}

export async function POST(req: NextRequest) {
  const ip = extractIp(req);
  const gate = await gateLogin(ip);
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
