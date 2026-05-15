/**
 * Slice contract for `resend-newsletter` — Phase A.
 *
 * Mirrors values from this slice's `slice.manifest.json`. The subscribe form
 * is public; admin send-broadcast + subscriber listing are auth-gated via
 * the four `newsletter.*` permissions. Convex tables follow the
 * 2026-05-12 namespace decision (`newsletter_` prefix) — the existing
 * non-namespaced schema in `convex/features/newsletter/` is migrated on
 * consumer adoption (see DNA lineage).
 */
import { defineSliceContract } from "../../../packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "resend-newsletter",
  version: "0.1.0",
  requires: {
    auth: "convex",
    rbac: [
      "newsletter.subscribe",
      "newsletter.unsubscribe",
      "newsletter.send-broadcast",
      "newsletter.list-subscribers",
    ],
    env: ["RESEND_API_KEY", "RESEND_FROM"],
    convex: {
      prefix: "newsletter_",
      tables: ["newsletter_subscribers", "newsletter_broadcasts"],
    },
    deps: ["convex-auth"],
  },
  provides: {
    tables: ["newsletter_subscribers", "newsletter_broadcasts"],
    routes: ["/newsletter"],
    components: ["SubscribeForm"],
  },
  conflicts: [],
  bidir: {
    syncPolicy: "manual",
    generalization: {
      level: "portable",
    },
  },
});
