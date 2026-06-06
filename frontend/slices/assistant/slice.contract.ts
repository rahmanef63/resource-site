/**
 * Slice contract for `assistant` — v1.0.0.
 *
 * Agent workspace (streaming chat + agents/skills/automations library,
 * localStorage-persisted). The model is injected via configureAssistantStream
 * (typing demo stream by default); shell services are no-op seams in lib/host.ts.
 */
import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "assistant",
  version: "1.0.0",
  category: "ai",
  kind: "ui",
  requires: {
    auth: "none" as const,
    rbac: [] as string[],
    env: [] as string[],
    deps: [
      { npm: "react", range: "^19" },
      { npm: "lucide-react", range: "^0.400.0" },
    ],
    shadcn: ["button", "input", "textarea", "tabs", "badge", "scroll-area", "dropdown-menu", "dialog", "select", "switch"],
    peers: [],
  },
  provides: {
    routes: [] as string[],
    components: ["Assistant"] as string[],
    hooks: [] as string[],
    utils: ["configureAssistantStream", "assistantApp"] as string[],
    tables: [] as string[],
  },
  conflicts: [],
});

export default contract;
