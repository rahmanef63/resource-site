// OAuth 2.1 token endpoint (RFC 6749 §3.2). Drop this file at
//   `app/api/oauth/token/route.ts`
// in your Next.js app.
//
// AI clients (ChatGPT custom app, Claude.ai connector, Cursor MCP) POST
// form-encoded:
//   grant_type=authorization_code
//   code=<code>
//   redirect_uri=<uri>
//   client_id=<id>
//   code_verifier=<verifier>
//
// Response: JSON { access_token, token_type, expires_in, scope? }

import { NextResponse } from "next/server";
import { convexHttp } from "@/shared/lib/convex-http";

export const runtime = "nodejs";

const errorResponse = (
  code: string,
  description: string,
  status = 400,
): NextResponse =>
  NextResponse.json(
    { error: code, error_description: description },
    {
      status,
      headers: { "cache-control": "no-store", pragma: "no-cache" },
    },
  );

const parseBody = async (req: Request): Promise<Record<string, string> | null> => {
  const ct = req.headers.get("content-type") ?? "";
  try {
    if (ct.includes("application/x-www-form-urlencoded")) {
      const text = await req.text();
      return Object.fromEntries(new URLSearchParams(text).entries());
    }
    if (ct.includes("application/json")) {
      return (await req.json()) as Record<string, string>;
    }
  } catch {
    return null;
  }
  return null;
};

export async function POST(req: Request) {
  const body = await parseBody(req);
  if (!body) return errorResponse("invalid_request", "Unparseable body");

  if (body.grant_type !== "authorization_code") {
    return errorResponse(
      "unsupported_grant_type",
      "Only authorization_code is supported",
    );
  }
  if (
    !body.code ||
    !body.redirect_uri ||
    !body.client_id ||
    !body.code_verifier
  ) {
    return errorResponse(
      "invalid_request",
      "Missing one of: code, redirect_uri, client_id, code_verifier",
    );
  }

  try {
    const result = (await convexHttp.mutation(
      "features/create_your_mcp:exchangeCode",
      {
        code: body.code,
        codeVerifier: body.code_verifier,
        redirectUri: body.redirect_uri,
        clientId: body.client_id,
      },
    )) as {
      access_token: string;
      token_type: string;
      expires_in: number;
      scope?: string;
    };
    return NextResponse.json(result, {
      headers: { "cache-control": "no-store", pragma: "no-cache" },
    });
  } catch (e) {
    // All invalid_grant variants collapse to a single opaque message at
    // the wire — distinguishing "code unknown" vs "consumed" vs "expired"
    // vs "PKCE mismatch" is useful only to attackers narrowing down the
    // captured flow. Detailed reason stays in Convex stderr.
    const message = e instanceof Error ? e.message : String(e);
    console.warn("oauth.token error", message);
    if (message.startsWith("invalid_grant")) {
      return errorResponse("invalid_grant", "code invalid", 400);
    }
    return errorResponse("server_error", "token exchange failed", 500);
  }
}

export async function GET() {
  return errorResponse("invalid_request", "Use POST", 405);
}
