// @vitest-environment node
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useFocused } from "./use-shell";
import { M, shellStore } from "../lib/store-state";
import { openWindow } from "../lib/store";

function resetStore() {
  M.state = {
    windows: {}, order: [], focused: null, activeSpace: 1,
    launcherOpen: false, spotlightOpen: false, inspectorOpen: false,
    notificationCenterOpen: false,
  };
  M.seq = 0;
}

function FocusLabel() {
  const id = useFocused();
  return <span>{id ? shellStore.getWindow(id)?.title : "Finder"}</span>;
}

describe("AppShell external-store SSR snapshot", () => {
  beforeEach(resetStore);
  afterEach(resetStore);

  it("stays deterministic even when the mutable client store already changed", () => {
    openWindow("welcome", "Welcome", { w: 520, h: 360 });
    expect(shellStore.getFocused()).not.toBeNull();
    expect(renderToString(<FocusLabel />)).toContain("Finder");
    expect(renderToString(<FocusLabel />)).not.toContain("Welcome");
  });
});
