import type { LayoutEntry } from "@/lib/content/layouts";
import type { RecipeEntry } from "@/lib/content/recipes";
import type { Source } from "@/lib/content/sources";

function tsLit(s: string): string {
  if (s.includes("\n") || s.includes("`")) {
    return "`" + s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${") + "`";
  }
  return JSON.stringify(s);
}

function strList(arr: string[]): string {
  if (!arr.length) return "[]";
  return "[" + arr.map(tsLit).join(", ") + "]";
}

export function emitLayoutsTs(layouts: LayoutEntry[]): string {
  const items = layouts.map((l) => {
    return `  {
    slug: ${tsLit(l.slug)},
    title: ${tsLit(l.title)},
    category: ${tsLit(l.category)} as const,
    description:
      ${tsLit(l.description)},
    source: ${tsLit(l.source)},
    repoPath: ${tsLit(l.repoPath)},
    primaryFile: ${tsLit(l.primaryFile)},
    tags: ${strList(l.tags)},
    exampleCode: ${tsLit(l.exampleCode)},
    agentRecipe: ${tsLit(l.agentRecipe)},
  }`;
  });

  return `export type LayoutEntry = {
  slug: string;
  title: string;
  category: "marketing" | "dashboard" | "cms";
  description: string;
  source: string;
  repoPath: string;
  primaryFile: string;
  exampleCode: string;
  agentRecipe: string;
  tags: string[];
};

export const layouts: LayoutEntry[] = [
${items.join(",\n")},
];

export function getLayout(slug: string) {
  return layouts.find((l) => l.slug === slug);
}
`;
}

export function emitRecipesTs(recipes: RecipeEntry[]): string {
  const items = recipes.map((r) => {
    return `  {
    slug: ${tsLit(r.slug)},
    title: ${tsLit(r.title)},
    description:
      ${tsLit(r.description)},
    source: ${tsLit(r.source)},
    repoPath: ${tsLit(r.repoPath)},
    files: ${strList(r.files)},
    tags: ${strList(r.tags)},
    exampleCode: ${tsLit(r.exampleCode)},
    agentRecipe: ${tsLit(r.agentRecipe)},
  }`;
  });

  return `export type RecipeEntry = {
  slug: string;
  title: string;
  description: string;
  source: string;
  repoPath: string;
  files: string[];
  exampleCode: string;
  agentRecipe: string;
  tags: string[];
};

export const recipes: RecipeEntry[] = [
${items.join(",\n")},
];

export function getRecipe(slug: string) {
  return recipes.find((r) => r.slug === slug);
}
`;
}

export function emitSourcesTs(sources: Source[]): string {
  const items = sources.map((s) => {
    const url = s.url ? `\n    url: ${tsLit(s.url)},` : "";
    const badge = s.badge ? `\n    badge: ${tsLit(s.badge)},` : "";
    return `  {
    id: ${tsLit(s.id)},
    name: ${tsLit(s.name)},
    description:
      ${tsLit(s.description)},${url}
    contributes: ${strList(s.contributes)},${badge}
  }`;
  });

  return `export type Source = {
  id: string;
  name: string;
  description: string;
  url?: string;
  contributes: string[];
  badge?: string;
};

export const sources: Source[] = [
${items.join(",\n")},
];
`;
}

export type SiteData = {
  name: string;
  shortName: string;
  description: string;
  tagline: string;
  url: string;
  repo: string;
  author: string;
  authorUrl: string;
};

export function emitSiteTs(s: SiteData): string {
  return `export const site = {
  name: ${tsLit(s.name)},
  shortName: ${tsLit(s.shortName)},
  description:
    ${tsLit(s.description)},
  tagline: ${tsLit(s.tagline)},
  url: ${tsLit(s.url)},
  repo: ${tsLit(s.repo)},
  author: ${tsLit(s.author)},
  authorUrl: ${tsLit(s.authorUrl)},
  links: {
    github: ${tsLit(s.repo)},
    rahmanefCom: ${tsLit(s.authorUrl)},
    cescadesigns: "https://cescadesigns.com",
  },
};
`;
}
