import { act, fireEvent, render, screen } from "@testing-library/react";
import { Circle } from "lucide-react";
import { afterEach, describe, expect, it, vi } from "vitest";

import StartHere from "./app";
import {
  configureStartHere,
  type StartHereApp,
  type StartHereAdapter,
  type StartHereStage,
} from "./lib/host";

const apps: StartHereApp[] = [
  { id: "alpha", title: "Alpha", icon: Circle },
  { id: "beta", title: "Beta", icon: Circle },
];

const makeStages = (titles: Array<{ title: string; appIds: string[] }>): StartHereStage[] =>
  titles.map(({ title, appIds }) => ({
    title,
    blurb: `${title} blurb`,
    appIds,
  }));

const makeAdapter = (stages: StartHereStage[], open: StartHereAdapter["open"]): StartHereAdapter => ({
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

describe("StartHere", () => {
  it("renders authored stages, filters unknown stages out, and reconfigures safely", () => {
    const open = vi.fn();
    const stages = makeStages([
      { title: "Unknown first", appIds: ["unknown-1"] },
      { title: "Alpha stage", appIds: ["alpha"] },
      { title: "Unknown middle", appIds: ["unknown-2"] },
      { title: "Beta stage", appIds: ["beta"] },
      { title: "Unknown last", appIds: ["unknown-3"] },
    ]);

    act(() => {
      configureStartHere(makeAdapter(stages, open));
    });

    const { container } = render(<StartHere />);

    const headings = screen.getAllByRole("heading", { level: 2 });
    const headingText = headings.map((node) => node.textContent);
    expect(headingText).toEqual(["Alpha stage", "Beta stage"]);

    for (let index = 0; index < headings.length; index += 1) {
      const heading = headings[index];
      expect(heading.closest("div")?.textContent).toContain((index + 1).toString());
    }

    expect(screen.queryByText("Unknown first")).toBeNull();
    expect(screen.queryByText("Unknown middle")).toBeNull();
    expect(screen.queryByText("Unknown last")).toBeNull();

    expect(container.querySelectorAll("span.rotate-45").length).toBe(1);

    const openAlpha = screen.getByRole("button", { name: "Open Alpha" });
    fireEvent.click(openAlpha);

    expect(open).toHaveBeenCalledWith("alpha");

    act(() => {
      configureStartHere(
        makeAdapter(
          [
            { title: "Beta stage", blurb: "Beta", appIds: ["beta"] },
          ],
          open,
        ),
      );
    });

    expect(screen.queryByText("Alpha stage")).toBeNull();
    expect(screen.getByRole("heading", { level: 2, name: "Beta stage" })).not.toBeNull();
  });
});
