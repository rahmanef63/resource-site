export interface RichnessResult {
  pass: boolean;
  reason: string;
  suggestion: string;
  nodeCount: number;
  blockRatio: number;
  sectionCount: number;
  emptyContentRatio?: number;
  fakeKanban?: boolean;
}

const MIN_NODES: Record<string, number> = {
  streaming: 35,
  kanban: 28,
  landing: 22,
  social: 25,
  commerce: 25,
  portfolio: 18,
  dashboard: 12,
};

const MAX_BLOCK_RATIO: Record<string, number> = {
  streaming: 0.15,
  kanban: 0.10,
  landing: 0.20,
  social: 0.15,
  commerce: 0.10,
  portfolio: 0.20,
  dashboard: 0.70,
};

// Content nodes that MUST have a payload prop to be useful
const CONTENT_RULES: Record<string, string> = {
  text: "content",
  button: "text",
  iconButton: "icon",
};

// Max ratio of content nodes allowed to be empty (no payload)
const MAX_EMPTY_CONTENT_RATIO = 0.20;

export function validateLayoutRichness(
  schema: Record<string, unknown>,
  archetype: string,
): RichnessResult {
  const nodeEntries = Object.values(
    (schema.nodes as Record<string, { type: string; props?: Record<string, unknown> }>) ?? {},
  );
  const nodeCount = nodeEntries.length;
  const blockCount = nodeEntries.filter((n) => n.type?.endsWith("Block")).length;
  const blockRatio = nodeCount > 0 ? blockCount / nodeCount : 0;
  const sectionCount = nodeEntries.filter(
    (n) => n.type === "section" || n.type === "div",
  ).length;

  const minNodes = MIN_NODES[archetype] ?? 10;
  const maxBlockRatio = MAX_BLOCK_RATIO[archetype] ?? 0.70;

  if (nodeCount < minNodes) {
    return {
      pass: false,
      reason: `Only ${nodeCount} nodes (minimum ${minNodes} for ${archetype})`,
      suggestion: `Add more sections, content rows, and cards. Target: ${minNodes}+ nodes with rich nested structure.`,
      nodeCount,
      blockRatio,
      sectionCount,
    };
  }

  if (blockRatio > maxBlockRatio) {
    return {
      pass: false,
      reason: `${Math.round(blockRatio * 100)}% block widgets (max ${Math.round(maxBlockRatio * 100)}% for ${archetype})`,
      suggestion: `Replace smart block widgets with primitive composition: div + image + text + button. Blocks show empty state only.`,
      nodeCount,
      blockRatio,
      sectionCount,
    };
  }

  // Check content nodes for empty payloads
  const contentNodes = nodeEntries.filter((n) => n.type in CONTENT_RULES);
  if (contentNodes.length > 0) {
    const emptyContent = contentNodes.filter((n) => {
      const requiredProp = CONTENT_RULES[n.type];
      const val = n.props?.[requiredProp];
      return val === undefined || val === null || val === "";
    });
    const emptyContentRatio = emptyContent.length / contentNodes.length;
    if (emptyContentRatio > MAX_EMPTY_CONTENT_RATIO) {
      const examples = emptyContent
        .slice(0, 3)
        .map((n) => `${n.type} (missing "${CONTENT_RULES[n.type]}")`)
        .join(", ");
      return {
        pass: false,
        reason: `${emptyContent.length}/${contentNodes.length} content nodes are empty (${Math.round(emptyContentRatio * 100)}%)`,
        suggestion: `Fill content props: text→content, button→text, iconButton→icon. Empty examples: ${examples}. Every visible node must have its payload filled.`,
        nodeCount,
        blockRatio,
        sectionCount,
        emptyContentRatio,
      };
    }
  }

  // For kanban archetype: require a kanbanBlock node — static div boards can't drag
  if (archetype === "kanban") {
    const hasKanbanBlock = nodeEntries.some((n) => n.type === "kanbanBlock");
    if (!hasKanbanBlock) {
      return {
        pass: false,
        reason: "Kanban layout uses static divs instead of kanbanBlock — cards cannot be dragged",
        suggestion: "Replace the manual col-*/card-* div structure with a single kanbanBlock node. Set the 'columns' prop as an array of { id, title, items: KanbanItem[] }. The kanbanBlock widget is the only kanban type that supports drag-and-drop.",
        nodeCount,
        blockRatio,
        sectionCount,
        emptyContentRatio: 0,
        fakeKanban: true,
      };
    }
  }

  return {
    pass: true,
    reason: "Layout meets richness criteria",
    suggestion: "",
    nodeCount,
    blockRatio,
    sectionCount,
    emptyContentRatio: 0,
  };
}
