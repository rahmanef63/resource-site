// Builder project-form validation — the emitted command always uses the
// sanitized app name, so the form must SHOW that, and a bad email must be
// flagged before it lands in a scaffold.
import { describe, expect, it } from "vitest";
import * as React from "react";
import { cleanup, render, screen } from "@testing-library/react";

import { ProjectForm } from "./project-form";

const base = { appName: "my-app", brandName: "", ownerEmail: "" };

function renderForm(value: Partial<typeof base>) {
  cleanup();
  return render(<ProjectForm value={{ ...base, ...value }} onChange={() => {}} />);
}

describe("ProjectForm validation", () => {
  it("shows no notes for a clean form", () => {
    renderForm({});
    expect(screen.queryByText(/scaffolded as/)).toBeNull();
    expect(screen.queryByText(/valid email/)).toBeNull();
  });

  it("shows the sanitized folder name when app name differs", () => {
    renderForm({ appName: "My App!" });
    expect(screen.getByText(/scaffolded as/)).toBeTruthy();
    expect(screen.getByText("my-app-")).toBeTruthy();
  });

  it("flags an invalid email and sets aria-invalid", () => {
    renderForm({ ownerEmail: "not-an-email" });
    expect(screen.getByText(/valid email/)).toBeTruthy();
    const input = document.querySelector('input[type="email"]');
    expect(input?.getAttribute("aria-invalid")).toBe("true");
  });

  it("accepts a valid email and an empty email", () => {
    renderForm({ ownerEmail: "halo@example.com" });
    expect(screen.queryByText(/valid email/)).toBeNull();
    renderForm({ ownerEmail: "" });
    expect(screen.queryByText(/valid email/)).toBeNull();
  });
});
