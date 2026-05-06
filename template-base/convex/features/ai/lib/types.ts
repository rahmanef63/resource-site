/**
 * FeatureAgent — minimal port of the type used by studio's agents/index.ts.
 * Original: superspace/convex/platform/ai/lib/types.ts. Path here matches
 * the relative import expected by `convex/features/studio/agents/index.ts`.
 */

import { FunctionReference } from "convex/server";
import { ZodObject } from "zod";

export interface FeatureAgent {
  tools: Record<
    string,
    {
      description: string;
      args: ZodObject<any>;
      type: "mutation" | "query";
      handler: FunctionReference<any, "public">;
    }
  >;
}
