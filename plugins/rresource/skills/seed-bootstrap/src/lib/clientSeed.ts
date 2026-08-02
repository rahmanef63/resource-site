// Vendored in plugins/rresource. Self-contained — no cross-slice imports.
// Default state = localStorage. Optional Convex schema + fns under ./convex/.

const SEED_KEY = "rresource:seed:done";

export function hasSeededLocally(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(SEED_KEY) === "1";
}

export function markSeededLocally(): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SEED_KEY, "1");
}

export async function seedLocallyOnce(seed: () => Promise<void> | void): Promise<void> {
  if (hasSeededLocally()) return;
  await seed();
  markSeededLocally();
}
