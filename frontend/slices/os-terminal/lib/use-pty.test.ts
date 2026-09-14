import { describe, expect, it, vi } from "vitest";
import {
  configurePty,
  hasPty,
  subscribePty,
  type PtyConfig,
} from "./use-pty";

describe("os-terminal PTY config", () => {
  it("notifies framework renderers when PTY wiring changes", () => {
    const listener = vi.fn();
    const unsubscribe = subscribePty(listener);
    const config: PtyConfig = {
      transport: vi.fn(),
      screen: vi.fn(),
    };
    configurePty(config);
    expect(hasPty()).toBe(true);
    configurePty(null);
    expect(hasPty()).toBe(false);
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
  });
});
