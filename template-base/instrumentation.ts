/**
 * Next 16 instrumentation hook.
 * - register(): OTel setup if applicable
 * - onRequestError(): centralized error capture (Sentry / Convex / log)
 */

export async function register() {
  // Add OpenTelemetry / Sentry init here when applicable.
  // Keep it lightweight; this runs once per server start.
}

export const onRequestError: import("next/dist/server/instrumentation/types").OnRequestErrorHook = async (
  error,
  request,
  context,
) => {
  // Forward to your error sink (Sentry, Logtail, Convex action, etc.)
  console.error("[onRequestError]", {
    digest: (error as any)?.digest,
    message: (error as Error)?.message,
    routerKind: context.routerKind,
    routePath: context.routePath,
    routeType: context.routeType,
    method: request.method,
    url: request.url,
  });
};
