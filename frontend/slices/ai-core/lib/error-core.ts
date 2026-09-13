// Framework-neutral error parsing + presentation model shared by React and Svelte adapters.

export type ChatErrData = {
  code: string;
  status?: number;
  detail: string;
  provider?: string;
  model?: string;
};

export function errData(e: unknown): ChatErrData | string {
  const d = (e as { data?: unknown })?.data;
  if (d && typeof d === "object") return d as ChatErrData;
  if (typeof d === "string" && d) return d;
  return e instanceof Error ? e.message : String(e);
}

export const FRIENDLY: Record<string, (provider: string) => string> = {
  not_connected: (p) => `${p} isn't connected — add it in the Providers tab.`,
  invalid_api_key: (p) => `Your ${p} API key was rejected — check it in the Providers tab.`,
  rate_limited: (p) => `${p} is rate-limiting requests right now — try again shortly.`,
  quota_exceeded: (p) => `${p} says this key is out of credit or quota.`,
  not_found: (p) => `This model isn't available from ${p} — try a different one.`,
  unreachable: (p) => `Couldn't reach ${p} — check the endpoint URL and that the host is online.`,
  invalid_request: (p) => `${p} couldn't process this request — try a different model.`,
  provider_error: (p) => `${p} had a problem handling this request. Try again.`,
  internal: () => `Something went wrong on our side. Try again, or ask an admin.`,
};

export type ErrorPresentation = {
  parsed: ChatErrData | string;
  headline: string;
  full: string;
  adminLine: string | null;
};

export function presentError(
  e: unknown,
  labels?: Record<string, string>,
): ErrorPresentation {
  const parsed = errData(e);
  const label = (provider: string) => labels?.[provider] ?? provider;
  const headline =
    typeof parsed === "string"
      ? parsed
      : !parsed.provider
        ? parsed.detail
        : (FRIENDLY[parsed.code] ?? FRIENDLY.internal)(label(parsed.provider));
  const full = typeof parsed === "string" ? parsed : JSON.stringify(parsed, null, 2);
  const adminLine =
    typeof parsed !== "string" && parsed.provider
      ? `${parsed.code}${parsed.status != null ? ` · ${parsed.status}` : ""}${parsed.model ? ` · ${parsed.model}` : ""} · ${parsed.detail}`
      : null;
  return { parsed, headline, full, adminLine };
}
