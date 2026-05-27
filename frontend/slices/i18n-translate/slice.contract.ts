/**
 * i18n-translate slice contract.
 *
 * Pure-UI client-side widget. No Convex tables, no env vars, no peer
 * slices. Consumer must add the listed CSP entries to their middleware
 * or proxy for the Google Translate script to load.
 */

import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "i18n-translate",
  version: "0.1.0",
  category: "ui",
  kind: "ui",
  provides: {
    components: ["GoogleTranslate"],
    utils: ["useGoogleTranslate", "DEFAULT_LANGUAGES"],
    hooks: ["useGoogleTranslate"],
    convex: { tables: [], rbac: [] },
  },
  requires: {
    deps: [
      { npm: "lucide-react", range: "^0.400.0" },
      { npm: "next", range: "^15" },
      { npm: "react", range: "^18" },
    ],
    shadcn: [],
    env: [],
    peers: [],
  },
  conflicts: [],
});
