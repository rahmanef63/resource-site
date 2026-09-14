import { getContext, setContext } from "svelte";
import type { LandingStore } from "../../sections/lib/core";

const LANDING_STORE = Symbol("rr.sections.store");
export type LandingStoreGetter = () => LandingStore;

export function provideLandingStore(getter: LandingStoreGetter): void {
  setContext(LANDING_STORE, getter);
}

export function useLandingStore(): LandingStoreGetter {
  const getter = getContext<LandingStoreGetter | undefined>(LANDING_STORE);
  if (!getter) throw new Error("Landing store is unavailable. Pass store= or wrap with <LandingProvider>.");
  return getter;
}
