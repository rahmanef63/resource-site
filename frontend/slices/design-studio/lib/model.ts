import { Circle, MousePointer, Smile, Square, Type, type LucideIcon } from "lucide-react";
import { TOOL_META, type ToolId } from "./model-core";
export * from "./model-core";
export type Tool = { id: ToolId; key: string; label: string; icon: LucideIcon };
const ICONS: Record<ToolId, LucideIcon> = { move: MousePointer, text: Type, rect: Square, ellipse: Circle, sticker: Smile };
export const TOOLS: Tool[] = TOOL_META.map((tool) => ({ ...tool, icon: ICONS[tool.id] }));
