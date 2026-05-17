import type { PreviewView } from "@/lib/preview-presets";

export type TemplateDetailData = {
  slug: string;
  title: string;
  description: string;
  source: string;
  repoPath: string;
  primaryFile?: string;
  files?: string[];
  pullPaths?: string[];
  dependencies?: string[];
  exampleCode: string;
  agentRecipe: string;
  tags: string[];
  previewPath?: string;
  adminPreviewPath?: string;
  defaultSurface?: "public" | "admin";
  defaultView?: PreviewView;
  defaultZoom?: number;
  badge?: string;
};

export type TemplateDetailNeighbor = { slug: string; title: string };
