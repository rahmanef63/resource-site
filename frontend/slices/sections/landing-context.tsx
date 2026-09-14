"use client";

import * as React from "react";
import type { LandingStore } from "./lib/core";

/** React context adapter around the portable LandingStore contract. */
const Ctx = React.createContext<LandingStore | null>(null);

export function LandingProvider({
  value,
  children,
}: {
  value: LandingStore;
  children: React.ReactNode;
}) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLandingStore(): LandingStore {
  const ctx = React.useContext(Ctx);
  if (!ctx) {
    throw new Error(
      "useLandingStore must be used inside <LandingProvider /> — wrap your template's StoreProvider with it.",
    );
  }
  return ctx;
}

export type { LandingStore } from "./lib/core";
