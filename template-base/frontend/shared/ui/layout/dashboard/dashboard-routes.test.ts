import { describe, expect, it } from "vitest";

import {
  AUTHENTICATED_DASHBOARD_BASE,
  GUEST_DASHBOARD_BASE,
  getDashboardFeatureHref,
  getDashboardHomeHref,
  getDashboardRouteInfo,
  getWorkspaceOnboardingHref,
  isWorkspaceOnboardingRoute,
  rebaseDashboardPath,
} from "./dashboard-routes";

describe("dashboard-routes", () => {
  it("parses authenticated dashboard root as overview", () => {
    expect(getDashboardRouteInfo("/dashboard")).toMatchObject({
      base: AUTHENTICATED_DASHBOARD_BASE,
      slug: null,
      isRoot: true,
      isOverview: true,
      isHome: false,
    });
  });

  it("parses guest home correctly", () => {
    expect(getDashboardRouteInfo("/mock-dashboard/home")).toMatchObject({
      base: GUEST_DASHBOARD_BASE,
      slug: "home",
      isRoot: false,
      isOverview: false,
      isHome: true,
    });
  });

  it("keeps nested feature segments for either dashboard base", () => {
    expect(getDashboardRouteInfo("/dashboard/analytics/reports")).toMatchObject({
      base: AUTHENTICATED_DASHBOARD_BASE,
      slug: "analytics",
      relativeSegments: ["analytics", "reports"],
    });

    expect(getDashboardRouteInfo("/mock-dashboard/tasks")).toMatchObject({
      base: GUEST_DASHBOARD_BASE,
      slug: "tasks",
      relativeSegments: ["tasks"],
    });
  });

  it("builds explicit feature and home hrefs", () => {
    expect(getDashboardFeatureHref(GUEST_DASHBOARD_BASE, "overview")).toBe("/mock-dashboard/overview");
    expect(getDashboardFeatureHref(AUTHENTICATED_DASHBOARD_BASE, "analytics")).toBe("/dashboard/analytics");
    expect(getDashboardHomeHref(GUEST_DASHBOARD_BASE)).toBe("/mock-dashboard/home");
    expect(getWorkspaceOnboardingHref()).toBe("/dashboard/workspace");
  });

  it("rebases dashboard paths onto the guest base", () => {
    expect(rebaseDashboardPath("/dashboard/ai", GUEST_DASHBOARD_BASE)).toBe("/mock-dashboard/ai");
    expect(rebaseDashboardPath("/dashboard/analytics/reports", GUEST_DASHBOARD_BASE)).toBe(
      "/mock-dashboard/analytics/reports",
    );
  });

  it("identifies the immersive workspace onboarding route without matching workspace store", () => {
    expect(isWorkspaceOnboardingRoute("/dashboard/workspace")).toBe(true);
    expect(isWorkspaceOnboardingRoute("/dashboard/workspace-store")).toBe(false);
    expect(isWorkspaceOnboardingRoute("/dashboard/overview")).toBe(false);
  });
});
