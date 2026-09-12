import { act, renderHook } from "@testing-library/react";
import { Circle } from "lucide-react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  configureStartHere,
  type StartHereAdapter,
  type StartHereApp,
  type StartHereStage,
  useStartHereApi,
} from "./host";

const apps: StartHereApp[] = [{ id: "alpha", title: "Alpha", icon: Circle }];

const makeAdapter = (
  stages: StartHereStage[],
  open: StartHereAdapter["open"],
): StartHereAdapter => ({
  mode: "live",
  apps,
  stages,
  open,
});

afterEach(() => {
  act(() => {
    configureStartHere({
      mode: "mock",
      apps: [],
      stages: [],
      open: () => {},
    });
  });
});

describe("keeps stable api identity while reacting to adapter replacement", () => {
  it("keeps stable api identity while reacting to adapter replacement", () => {
    const stagesA: StartHereStage[] = [
      { title: "Stage A", blurb: "A", appIds: ["alpha"] },
    ];
    const stagesB: StartHereStage[] = [
      { title: "Stage B", blurb: "B", appIds: ["alpha"] },
    ];
    const openA = vi.fn();
    const openB = vi.fn();

    act(() => {
      configureStartHere(makeAdapter(stagesA, openA));
    });

    let renders = 0;
    const { result } = renderHook(() => {
      renders += 1;
      return useStartHereApi();
    });

    const first = result.current;
    expect(first.stages).toBe(stagesA);

    act(() => {
      configureStartHere(makeAdapter(stagesB, openB));
    });

    expect(result.current).toBe(first);
    expect(renders).toBeGreaterThan(1);
    expect(result.current.stages).toBe(stagesB);

    result.current.open("alpha");
    expect(openA).not.toHaveBeenCalled();
    expect(openB).toHaveBeenCalledWith("alpha");
  });
});
