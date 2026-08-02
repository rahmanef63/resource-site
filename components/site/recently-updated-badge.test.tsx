// Regression suite for the W2 nested-anchor bug: the card variant used to
// render its own <Link> inside CatalogCard's <Link> — invalid HTML and a
// confirmed hydration error. Also pins the page-aware deep-link format.
import { describe, expect, it } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { RecentlyUpdatedBadge } from "./recently-updated-badge";
import {
  changelogHref,
  getLatestUpdate,
  CHANGELOG_PAGE_SIZE,
} from "@/lib/content/changelog-helpers";

// A slug guaranteed to have a changelog reference (HARDEN-W1 onward).
const SLUG = "rate-limit";

describe("RecentlyUpdatedBadge", () => {
  it("card variant renders NO anchor (it nests inside CatalogCard's Link)", async () => {
    const { container } = render(
      <RecentlyUpdatedBadge slug={SLUG} kind="slice" variant="card" />,
    );
    await waitFor(() => expect(container.textContent).toContain("Updated"));
    expect(container.querySelector("a")).toBeNull();
  });

  it("badge variant links to the page that contains the entry", async () => {
    const { container } = render(
      <RecentlyUpdatedBadge slug={SLUG} kind="slice" variant="badge" />,
    );
    await waitFor(() => expect(container.textContent).toContain("Updated"));
    const a = container.querySelector("a");
    expect(a).not.toBeNull();
    expect(a!.getAttribute("href")).toMatch(/^\/changelog(\?page=\d+)?#.+$/);
  });

  it("renders nothing for a slug with no changelog reference", () => {
    const { container } = render(
      <RecentlyUpdatedBadge slug="no-such-slice" kind="slice" variant="card" />,
    );
    expect(container.firstChild).toBeNull();
  });
});

describe("changelogHref", () => {
  it("omits ?page= for page 1", () => {
    expect(changelogHref({ releaseId: "X", page: 1 })).toBe("/changelog#X");
  });

  it("carries ?page= for deeper pages", () => {
    expect(changelogHref({ releaseId: "LIFT-LIBRARY", page: 5 })).toBe(
      "/changelog?page=5#LIFT-LIBRARY",
    );
  });
});

describe("getLatestUpdate page math", () => {
  it("reports a 1-based page consistent with PAGE_SIZE", () => {
    const ref = getLatestUpdate(SLUG, "slice");
    expect(ref).not.toBeNull();
    expect(ref!.page).toBeGreaterThanOrEqual(1);
    expect(Number.isInteger(ref!.page)).toBe(true);
    expect(CHANGELOG_PAGE_SIZE).toBe(10);
  });
});
