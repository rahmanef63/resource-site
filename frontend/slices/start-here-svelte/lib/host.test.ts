// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  configureStartHere,
  startHereApi,
  type StartHereAdapter,
  type StartHereApp,
  type StartHereStage,
} from "./host";

const apps: StartHereApp[] = [{ id: "alpha", title: "Alpha" }];
const stagesA: StartHereStage[] = [{ title: "A", blurb: "A", appIds: ["alpha"] }];
const stagesB: StartHereStage[] = [{ title: "B", blurb: "B", appIds: ["alpha"] }];

function adapter(stages: StartHereStage[], open: StartHereAdapter["open"]): StartHereAdapter {
  return { mode: "live", apps, stages, open };
}

afterEach(() => {
  configureStartHere({ mode: "mock", apps: [], stages: [], open: () => {} });
});

describe("startHereApi", () => {
  it("keeps stable identity and notifies subscribers on adapter replacement", () => {
    const openA = vi.fn();
    const openB = vi.fn();
    const first = startHereApi;
    configureStartHere(adapter(stagesA, openA));

    const notifications: string[] = [];
    const unsubscribe = first.subscribe((api) => notifications.push(api.stages[0]?.title ?? "none"));
    configureStartHere(adapter(stagesB, openB));

    expect(startHereApi).toBe(first);
    expect(first.stages).toBe(stagesB);
    expect(notifications).toEqual(["A", "B"]);
    first.open("alpha");
    expect(openA).not.toHaveBeenCalled();
    expect(openB).toHaveBeenCalledWith("alpha");

    unsubscribe();
    configureStartHere(adapter(stagesA, openA));
    expect(notifications).toEqual(["A", "B"]);
  });
});
