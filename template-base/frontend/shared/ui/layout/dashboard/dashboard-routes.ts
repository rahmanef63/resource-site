export const AUTHENTICATED_DASHBOARD_BASE = "/dashboard" as const;
export const GUEST_DASHBOARD_BASE = "/mock-dashboard" as const;
export const AUTHENTICATED_WORKSPACE_ONBOARDING_PATH =
  `${AUTHENTICATED_DASHBOARD_BASE}/workspace` as const;

export type DashboardRouteBase =
  | typeof AUTHENTICATED_DASHBOARD_BASE
  | typeof GUEST_DASHBOARD_BASE;

export interface DashboardRouteInfo {
  base: DashboardRouteBase | null;
  pathname: string;
  relativePath: string;
  relativeSegments: string[];
  slug: string | null;
  isRoot: boolean;
  isHome: boolean;
  isOverview: boolean;
}

const DASHBOARD_BASES: DashboardRouteBase[] = [
  GUEST_DASHBOARD_BASE,
  AUTHENTICATED_DASHBOARD_BASE,
];

function sanitizePathname(pathname: string | null | undefined): string {
  return (pathname ?? "").split("?")[0].split("#")[0] ?? "";
}

export function getDashboardBaseForMode(isGuestMode: boolean): DashboardRouteBase {
  return isGuestMode ? GUEST_DASHBOARD_BASE : AUTHENTICATED_DASHBOARD_BASE;
}

export function getDashboardBaseHref(base: DashboardRouteBase): string {
  return base;
}

export function getDashboardFeatureHref(base: DashboardRouteBase, slug?: string | null): string {
  if (!slug || slug === "overview") {
    return `${base}/overview`;
  }

  return `${base}/${slug.replace(/^\/+/, "")}`;
}

export function getDashboardHomeHref(base: DashboardRouteBase): string {
  return `${base}/home`;
}

export function getWorkspaceOnboardingHref(): string {
  return AUTHENTICATED_WORKSPACE_ONBOARDING_PATH;
}

export function isWorkspaceOnboardingRoute(pathname: string | null | undefined): boolean {
  const routeInfo = getDashboardRouteInfo(pathname);

  return (
    routeInfo.base === AUTHENTICATED_DASHBOARD_BASE &&
    routeInfo.slug === "workspace" &&
    routeInfo.relativeSegments.length === 1
  );
}

export function rebaseDashboardPath(path: string, base: DashboardRouteBase): string {
  const safePath = sanitizePathname(path);
  const routeInfo = getDashboardRouteInfo(safePath);

  if (!routeInfo.base) {
    return safePath;
  }

  if (routeInfo.relativePath.length === 0) {
    return base;
  }

  return `${base}/${routeInfo.relativePath}`;
}

export function getDashboardRouteInfo(
  pathname: string | null | undefined,
  fallbackBase?: DashboardRouteBase,
): DashboardRouteInfo {
  const safePathname = sanitizePathname(pathname);
  const matchedBase =
    DASHBOARD_BASES.find(
      (base) => safePathname === base || safePathname.startsWith(`${base}/`),
    ) ?? null;
  const base = matchedBase ?? fallbackBase ?? null;
  const relativePath = matchedBase
    ? safePathname.slice(matchedBase.length).replace(/^\/+/, "")
    : "";
  const relativeSegments = relativePath.length > 0 ? relativePath.split("/").filter(Boolean) : [];
  const slug = relativeSegments[0] ?? null;
  const isRoot = Boolean(matchedBase) && relativeSegments.length === 0;
  const isHome = slug === "home";
  const isOverview = isRoot || slug === "overview";

  return {
    base,
    pathname: safePathname,
    relativePath,
    relativeSegments,
    slug,
    isRoot,
    isHome,
    isOverview,
  };
}
