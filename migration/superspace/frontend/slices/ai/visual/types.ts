export type AiChartVariant = "area" | "pie" | "waterfall";

export interface AiChartVisualBlock {
  type: "chart";
  title: string;
  subtitle?: string;
  variant: AiChartVariant;
  data: Array<Record<string, string | number>>;
}

export interface AiKpiCardsVisualBlock {
  type: "kpi_cards";
  title: string;
  subtitle?: string;
  items: Array<{
    label: string;
    value: string;
    badge?: string;
    tone?: "default" | "success" | "warning" | "destructive";
  }>;
}

export interface AiComparisonTableVisualBlock {
  type: "comparison_table";
  title: string;
  subtitle?: string;
  columns: string[];
  rows: string[][];
  summary?: string;
}

export interface AiActionListVisualBlock {
  type: "action_list";
  title: string;
  subtitle?: string;
  items: Array<{
    title: string;
    description?: string;
    priority?: "high" | "medium" | "low";
    impact?: string;
  }>;
}

export interface AiTableVisualBlock {
  type: "table";
  title: string;
  subtitle?: string;
  columns: string[];
  rows: string[][];
}

export type AiVisualBlock =
  | AiChartVisualBlock
  | AiKpiCardsVisualBlock
  | AiComparisonTableVisualBlock
  | AiActionListVisualBlock
  | AiTableVisualBlock;

/**
 * Parse a JSON code block tagged ```visual or a bare {visuals:[...]} payload.
 * Returns null if the response has no embedded visual block.
 */
export function extractVisualBlocks(text: string): AiVisualBlock[] | null {
  if (!text) return null;
  const fence = text.match(/```(?:visual|json)\s*([\s\S]+?)```/i);
  const candidate = fence?.[1]?.trim() ?? text.trim();
  try {
    const parsed = JSON.parse(candidate);
    if (Array.isArray(parsed?.visuals)) return parsed.visuals as AiVisualBlock[];
    if (Array.isArray(parsed)) return parsed as AiVisualBlock[];
  } catch {
    return null;
  }
  return null;
}
