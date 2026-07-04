/** Public types for ai-studio slice. */

export type OutputKind = "image" | "text" | "code" | "audio";
export type GenerationStatus = "queued" | "generating" | "done" | "error";

export type GenerationVariant = {
  id: string;
  index: number;
  outputStorageId?: string;
  outputInline?: string;
  liked?: boolean;
};

export type Generation = {
  id: string;
  workspaceId: string;
  userId: string;
  prompt: string;
  kind: OutputKind;
  modelId: string;
  templateSlug?: string;
  parentId?: string;
  variants: GenerationVariant[];
  status: GenerationStatus;
  cost?: number;
  createdAt: number;
};

export type GeneratorBindings = {
  list: unknown;
  create: unknown;
  branch: unknown;
  remove: unknown;
};
