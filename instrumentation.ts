// Next 16 instrumentation entry. `register()` runs once at server boot;
// `onRequestError` fires on every uncaught error in a request lifecycle.
// Wire your APM/log sink here (Sentry, OpenTelemetry, Datadog, etc.).
// Reference: nextjs.org/docs/app/building-your-application/optimizing/instrumentation

export function register() {
  // No-op for now — site is read-only docs. Wire OTel SDK here when telemetry
  // is needed (e.g., user-action analytics, Convex query perf trace).
}

type ErrorReporterRequest = { url?: string } | undefined;
type ErrorReporterContext = { routerKind?: string; routePath?: string } | undefined;

export function onRequestError(
  err: unknown,
  request: ErrorReporterRequest,
  context: ErrorReporterContext,
) {
  // Console-only in this kitab; replace with Sentry.captureException(err, ...)
  // or your provider of choice in real deployments.
  console.error("[instrumentation] request error:", {
    url: request?.url ?? null,
    routerKind: context?.routerKind ?? null,
    routePath: context?.routePath ?? null,
    err,
  });
}
