/**
 * Vitest base setup — runs before every test, env-agnostic.
 *
 * Add convex.config mocks + console-noise filters here. Anything that
 * touches `window`/`document` belongs in `setup-react.ts` (jsdom-only).
 */

import { vi } from "vitest";

const originalConsoleWarn = console.warn;

console.warn = (...args: Parameters<typeof console.warn>) => {
  const [firstArg] = args;
  const message = typeof firstArg === "string" ? firstArg : String(firstArg ?? "");
  if (message.includes("KaTeX doesn't work in quirks mode")) return;
  originalConsoleWarn(...args);
};

vi.mock("../convex/convex.config", () => {
  const mockApp = { use: vi.fn() };
  return { default: mockApp };
});
