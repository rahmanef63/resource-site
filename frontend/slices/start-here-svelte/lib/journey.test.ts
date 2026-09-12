// @vitest-environment node
import { describe, expect, it } from "vitest";
import { resolveStartHereStages } from "./journey";
import type { StartHereApp, StartHereStage } from "./host";

const apps: StartHereApp[] = [
  { id: "alpha", title: "Alpha" },
  { id: "beta", title: "Beta" },
  { id: "gamma", title: "Gamma" },
];

describe("resolveStartHereStages", () => {
  it("filters unknown/empty authored stages and appends unplaced apps", () => {
    const stages: StartHereStage[] = [
      { title: "Unknown", blurb: "none", appIds: ["missing"] },
      { title: "First", blurb: "first", appIds: ["alpha", "missing-2"] },
      { title: "Empty", blurb: "none", appIds: [] },
    ];

    const resolved = resolveStartHereStages(apps, stages);
    expect(resolved.map((stage) => stage.title)).toEqual(["First", "Everything else"]);
    expect(resolved[0]?.tiles.map((app) => app.id)).toEqual(["alpha"]);
    expect(resolved[1]?.tiles.map((app) => app.id)).toEqual(["beta", "gamma"]);
  });

  it("does not append Everything else when every app is placed", () => {
    const stages: StartHereStage[] = [
      { title: "All", blurb: "all", appIds: ["alpha", "beta", "gamma"] },
    ];
    expect(resolveStartHereStages(apps, stages).map((stage) => stage.title)).toEqual(["All"]);
  });
});
