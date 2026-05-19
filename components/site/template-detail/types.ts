import type { PreviewView } from "@/lib/preview-presets";
import type { SliceFile } from "@/lib/slice-files";

export type TemplateDetailData = {
  slug: string;
  title: string;
  description: string;
  source: string;
  repoPath: string;
  primaryFile?: string;
  files?: string[];
  pullPaths?: string[];
  /** Server-pre-read file contents for the in-browser code viewer. */
  codeFiles?: SliceFile[];
  /** Root path the codeFiles were read from — shown as a header in the
   *  viewer. Typically equals `repoPath` or the first `pullPaths` entry. */
  codeRootPath?: string;
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
