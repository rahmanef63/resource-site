"use client";

import { createContext, useContext, type ComponentType, type ReactNode } from "react";
import type { FeatureDescriptor, SlotRegion } from "./types";

// Features are injected by the consumer's manifest, never imported by the core.
const FeatureContext = createContext<FeatureDescriptor[]>([]);

export function FeatureRegistryProvider({
  features,
  children,
}: {
  features: FeatureDescriptor[];
  children: ReactNode;
}) {
  return <FeatureContext.Provider value={features}>{children}</FeatureContext.Provider>;
}

export function useFeatures(): FeatureDescriptor[] {
  return useContext(FeatureContext);
}

/**
 * Renders every registered feature's component for `region`, in manifest order.
 * Surfaces place <Slot region="…" /> where a region lives; the content is
 * whatever features contributed — so the shell composes itself from config.
 *
 * `slotProps` (optional): forwarded verbatim to every component mounted into
 * this region. `FeatureDescriptor.slots` types its components as bare
 * `ComponentType` (no props — the registry is a dynamic, per-region mapping
 * with no single shared prop shape), so the spread is cast locally here
 * rather than widening that shared type for every region. Today's only
 * consumer: mobile-shell.tsx passes `{ dragProgress }` into the `controlCenter`
 * region so ControlCenter's existing optional drag-follow prop (P2
 * ios-nc-cc-drag-follow) can actually receive live data — omit `slotProps`
 * (the default) and every region renders exactly as before.
 */
export function Slot({ region, slotProps }: { region: SlotRegion; slotProps?: Record<string, unknown> }) {
  const features = useFeatures();
  return (
    <>
      {features.map((f) => {
        const C = f.slots?.[region] as ComponentType<Record<string, unknown>> | undefined;
        return C ? <C key={f.id} {...slotProps} /> : null;
      })}
    </>
  );
}
