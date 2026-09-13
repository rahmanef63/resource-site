import { describe, expect, it } from "vitest";
import { marqueeMode, marqueeRect } from "./marquee";

describe("selection Svelte marquee geometry", () => {
  it("uses rightward window selection and normalizes the rectangle", () => {
    expect(marqueeRect(10, 20, 40, 5)).toEqual({ x: 10, y: 5, w: 30, h: 15, mode: "window" });
  });

  it("uses leftward crossing selection", () => {
    expect(marqueeMode(40, 10)).toBe("crossing");
    expect(marqueeRect(40, 20, 10, 35).mode).toBe("crossing");
  });

  it("can force crossing mode when AutoCAD direction is disabled", () => {
    expect(marqueeMode(10, 40, false)).toBe("crossing");
  });
});
