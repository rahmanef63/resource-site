// Compat notes must give a path forward: action text + a link to the slice,
// and incompatible pairs get blocker (red) treatment, not a soft note.
import { describe, expect, it } from "vitest";
import * as React from "react";
import { cleanup, render, screen } from "@testing-library/react";

import { CommandOutput } from "./command-output";
import type { CompatWarning } from "@/lib/build/compat";

const blocks = [{ heading: "Scaffold", script: "npx rahman-resources init my-app" }];

const warn: CompatWarning = {
  featureSlug: "resend-newsletter",
  featureTitle: "Resend Newsletter",
  templateSlug: "landing",
  templateTitle: "Landing",
  status: "warn",
  note: "needs RESEND_API_KEY",
  action: "Still emitted — wire it manually after scaffolding (see the slice page for steps).",
};

const incompatible: CompatWarning = {
  ...warn,
  featureSlug: "convex-auth",
  featureTitle: "Convex Auth",
  status: "incompatible",
  note: "clashes with the template's auth",
  action: "Drop this slice or pick a different template — the pair won't work together.",
};

function renderOut(warnings: CompatWarning[]) {
  cleanup();
  return render(<CommandOutput blocks={blocks} warnings={warnings} />);
}

describe("CommandOutput compat notes", () => {
  it("renders nothing extra without warnings", () => {
    renderOut([]);
    expect(screen.queryByText(/compatibility note/)).toBeNull();
  });

  it("warn-only stays amber and links the slice page", () => {
    const { container } = renderOut([warn]);
    expect(screen.getByText("1 compatibility note").className).toContain("amber");
    const link = screen.getByText(/View slice/).closest("a");
    expect(link?.getAttribute("href")).toBe("/slices/resend-newsletter");
    expect(container.textContent).toContain("wire it manually");
  });

  it("any incompatible escalates the box to blocker red", () => {
    renderOut([warn, incompatible]);
    expect(screen.getByText("2 compatibility notes").className).toContain("red");
    expect(screen.getByText(/Drop this slice or pick a different template/)).toBeTruthy();
  });
});
