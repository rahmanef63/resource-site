import { z } from "zod";

export const BaseFeatureMetadataSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  description: z.string(),
  featureType: z.enum(["default","system","optional","experimental"]),
  category: z.enum([
    "communication","productivity","collaboration","administration","social","creativity","analytics"
  ]),
  icon: z.string(),
  path: z.string(),
  component: z.string(),
  order: z.number(),
  type: z.enum(["route","folder","divider","action","chat","document"]),
  requiresPermission: z.string().optional(),
  version: z.string(),
  hasUI: z.boolean().default(true),
  hasConvex: z.boolean().default(true),
  hasTests: z.boolean().default(true),
  generationMode: z
    .enum(["full-json", "hybrid-json", "engine-owned"])
    .default("full-json"),
  sharedEngineId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  dependencies: z.array(z.string()).optional(),
  author: z.string().optional(),
  status: z.enum(["stable","beta","development","experimental","deprecated"]).optional(),
  isReady: z.boolean().optional(),
  expectedRelease: z.string().optional(),
  hasSettings: z.boolean().optional(),
  settingsPath: z.string().optional(),
});

export type FeatureMetadata = z.infer<typeof BaseFeatureMetadataSchema> & {
  children?: FeatureMetadata[];
};

export const FeatureMetadataSchema: z.ZodType<FeatureMetadata> =
  BaseFeatureMetadataSchema.extend({
    children: z.lazy(() => z.array(FeatureMetadataSchema)).optional(),
  });
