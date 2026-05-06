/**
 * FeatureAgent — minimal port from superspace/convex/platform/ai/lib/types.ts.
 * Keeps Studio's `agents/index.ts` typed during the resources/ extraction.
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
