/**
 * Next.js 16 request-time proxy boundary.
 * Optimistic auth check + redirects only. NOT the security boundary —
 * authn+authz still enforced in Server Actions / Route Handlers / Convex DAL.
 */

import {
  convexAuthNextjsToken,
  isAuthenticatedNextjs,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";
import { convexAuthNextjsMiddleware } from "@convex-dev/auth/nextjs/server";
import { createRouteMatcher } from "@convex-dev/auth/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/admin(.*)"]);
const isLandingRoute = createRouteMatcher(["/"]);
const isAuthRoute = createRouteMatcher(["/sign-in", "/sign-up"]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  const isSignedIn = await convexAuth.isAuthenticated();

  if (isSignedIn && isLandingRoute(request)) {
    return nextjsMiddlewareRedirect(request, "/dashboard/overview");
  }
  if (isSignedIn && isAuthRoute(request)) {
    return nextjsMiddlewareRedirect(request, "/dashboard/overview");
  }
  if (!isSignedIn && isProtectedRoute(request)) {
    return nextjsMiddlewareRedirect(request, "/sign-in");
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
