"use client";

import * as React from "react";
import { SEED_DELIVERIES, SEED_ENDPOINTS } from "./seed";
import type { WebhookDelivery, WebhookEndpoint } from "./types";

/** Adapter pattern (CC-wave). View consumes endpoints + deliveries +
 *  per-endpoint actions. Convex impl wraps useQuery + useMutation; a
 *  scheduled function performs retry-with-backoff out of band. */
export type WebhooksBindings = {
  endpoints: WebhookEndpoint[];
  deliveries: WebhookDelivery[];
  isLoading: boolean;
  togglePause: (id: string) => void;
  remove: (id: string) => void;
};

export function useDefaultWebhooksBindings(): WebhooksBindings {
  const [endpoints, setEndpoints] =
    React.useState<WebhookEndpoint[]>(SEED_ENDPOINTS);
  const togglePause: WebhooksBindings["togglePause"] = React.useCallback(
    (id) =>
      setEndpoints((prev) =>
        prev.map((e) =>
          e.id === id
            ? { ...e, status: e.status === "paused" ? "active" : "paused" }
            : e,
        ),
      ),
    [],
  );
  const remove: WebhooksBindings["remove"] = React.useCallback(
    (id) => setEndpoints((prev) => prev.filter((e) => e.id !== id)),
    [],
  );
  return {
    endpoints,
    deliveries: SEED_DELIVERIES,
    isLoading: false,
    togglePause,
    remove,
  };
}

const Ctx = React.createContext<WebhooksBindings | null>(null);

export function WebhooksBindingsProvider({
  value,
  children,
}: {
  value: WebhooksBindings;
  children: React.ReactNode;
}) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWebhooksBindings(): WebhooksBindings {
  const ctx = React.useContext(Ctx);
  const fallback = useDefaultWebhooksBindings();
  return ctx ?? fallback;
}
