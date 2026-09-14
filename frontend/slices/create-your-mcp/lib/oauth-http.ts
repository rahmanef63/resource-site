import type { McpBackend } from "./backend";

const oauthError = (code: string, description: string, status = 400) =>
  Response.json(
    { error: code, error_description: description },
    { status, headers: { "cache-control": "no-store", pragma: "no-cache" } },
  );

const parseBody = async (req: Request): Promise<Record<string, string> | null> => {
  const type = req.headers.get("content-type") ?? "";
  try {
    if (type.includes("application/x-www-form-urlencoded")) {
      return Object.fromEntries(new URLSearchParams(await req.text()).entries());
    }
    if (type.includes("application/json")) return (await req.json()) as Record<string, string>;
  } catch {
    return null;
  }
  return null;
};

export async function handleOauthTokenPost(req: Request, backend: McpBackend): Promise<Response> {
  const body = await parseBody(req);
  if (!body) return oauthError("invalid_request", "Unparseable body");
  if (body.grant_type !== "authorization_code") {
    return oauthError("unsupported_grant_type", "Only authorization_code is supported");
  }
  if (!body.code || !body.redirect_uri || !body.client_id || !body.code_verifier) {
    return oauthError(
      "invalid_request",
      "Missing one of: code, redirect_uri, client_id, code_verifier",
    );
  }

  try {
    const result = await backend.exchangeCode({
      code: body.code,
      codeVerifier: body.code_verifier,
      redirectUri: body.redirect_uri,
      clientId: body.client_id,
    });
    return Response.json(result, {
      headers: { "cache-control": "no-store", pragma: "no-cache" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn("oauth.token error", message);
    if (message.startsWith("invalid_grant")) return oauthError("invalid_grant", "code invalid");
    return oauthError("server_error", "token exchange failed", 500);
  }
}

export function handleOauthTokenGet(): Response {
  return oauthError("invalid_request", "Use POST", 405);
}
