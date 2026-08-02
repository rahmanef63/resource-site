import type { AnthropicTool } from "@/shared/agentic";
import { getAssistantRegistry } from "./agentic-host";
import type { Agent, Skill, Tool, ToolGroup } from "./types";

// Tool catalog reused by the Agents / Skills / Automations editors and the
// chat. Two sources: the LIVE registry (slice ToolCollections registered via
// registerAssistantTools — really invokable) or, when nothing is registered,
// the static OS_TOOLS demo catalog (descriptors only; automations narrate).
export const GROUP_META: Record<
  string,
  { label: string; icon: string }
> = {
  files: { label: "File system", icon: "folder" },
  rendering: { label: "Rendering", icon: "image" },
  apps: { label: "Apps", icon: "grid" },
  media: { label: "Media", icon: "image" },
  system: { label: "System", icon: "gauge" },
  editor: { label: "Editor", icon: "code" },
  terminal: { label: "Terminal", icon: "terminal" },
  browser: { label: "Browser", icon: "globe" },
  settings: { label: "Settings", icon: "settings" },
  video: { label: "Video", icon: "film" },
};

export const GROUP_ORDER = Object.keys(GROUP_META) as ToolGroup[];

const T = (
  id: string,
  group: ToolGroup,
  name: string,
  desc: string,
  params: string[] = [],
): Tool => ({ id, group, name, desc, params });

export const OS_TOOLS: Tool[] = [
  T("files.list", "files", "List", "List a directory's contents.", ["path"]),
  T("files.create_folder", "files", "New folder", "Create a folder.", ["path", "name"]),
  T("files.create_file", "files", "New file", "Create a file.", ["path", "name"]),
  T("files.rename", "files", "Rename", "Rename a file or folder.", ["path", "name"]),
  T("files.move", "files", "Move", "Move a file or folder.", ["from", "to"]),
  T("files.delete", "files", "Delete", "Delete a file or folder.", ["path"]),
  T("files.open", "files", "Open", "Open a file.", ["path"]),
  T("files.search", "files", "Search", "Search files by name.", ["query"]),

  T("render.snapshot", "rendering", "Snapshot", "Capture a window snapshot.", ["target"]),
  T("render.export", "rendering", "Export frame", "Export the current frame.", ["format"]),

  T("apps.launch", "apps", "Launch app", "Open an app window.", ["app"]),
  T("apps.close", "apps", "Close app", "Close an app window.", ["app"]),
  T("apps.list", "apps", "List apps", "List open apps."),

  T("media.open", "media", "Open editor", "Open Image Editor."),
  T("media.set_aspect", "media", "Set aspect", "Set canvas aspect.", ["ratio"]),
  T("media.add_text", "media", "Add text", "Add a text layer.", ["text"]),
  T("media.add_sticker", "media", "Add sticker", "Add a sticker.", ["emoji"]),
  T("media.apply_filter", "media", "Apply filter", "Apply an image filter.", ["filter"]),
  T("media.export", "media", "Export", "Export the design.", ["format"]),

  T("system.stats", "system", "Stats", "Read system stats."),
  T("system.processes", "system", "Processes", "List running processes."),
  T("system.open_monitor", "system", "Monitor", "Open the system monitor."),

  T("editor.open", "editor", "Open file", "Open a file in the editor.", ["path"]),
  T("editor.edit", "editor", "Edit", "Apply an edit to the open file.", ["patch"]),
  T("editor.save", "editor", "Save", "Save the open file."),

  T("terminal.run", "terminal", "Run command", "Run a shell command.", ["command"]),
  T("terminal.open", "terminal", "Open shell", "Open a terminal."),

  T("browser.open", "browser", "Open URL", "Open a URL.", ["url"]),
  T("browser.new_tab", "browser", "New tab", "Open a new tab.", ["url"]),
  T("browser.bookmark", "browser", "Bookmark", "Bookmark the current page."),

  T("settings.set_theme", "settings", "Set theme", "Switch theme.", ["theme"]),
  T("settings.set_accent", "settings", "Set accent", "Set accent color.", ["color"]),
  T("settings.set_wallpaper", "settings", "Set wallpaper", "Set wallpaper.", ["id"]),
  T("settings.open", "settings", "Open settings", "Open the settings app."),

  T("video.open", "video", "Open editor", "Open the reel editor."),
  T("video.set_ratio", "video", "Set ratio", "Set the aspect ratio.", ["ratio"]),
  T("video.add_title", "video", "Add title", "Add a title.", ["text"]),
  T("video.split", "video", "Split", "Split at the playhead."),
  T("video.effect", "video", "Effect", "Add a motion effect.", ["effect"]),
  T("video.render", "video", "Render", "Render the reel."),
];

// ── Live catalog (registry-backed) ──────────────────────────────────────────

function fromAnthropic(t: AnthropicTool): Tool {
  const dot = t.name.indexOf(".");
  return {
    id: t.name,
    group: dot > 0 ? t.name.slice(0, dot) : "apps",
    name: dot > 0 ? t.name.slice(dot + 1) : t.name,
    desc: t.description,
    params: Object.keys(t.input_schema.properties ?? {}),
  };
}

/** Registered slice tools when any exist, else the static demo catalog. */
export function assistantCatalog(): Tool[] {
  const reg = getAssistantRegistry();
  if (reg.size() === 0) return OS_TOOLS;
  return reg.anthropicTools().map(fromAnthropic);
}

export function groupMeta(g: string): { label: string; icon: string } {
  return GROUP_META[g] ?? { label: g, icon: "grid" };
}

/** Groups present in a catalog, demo groups first, then slice namespaces. */
export function catalogGroups(
  catalog: Tool[],
): { id: string; label: string; icon: string }[] {
  const ids: string[] = [];
  for (const t of catalog) if (!ids.includes(t.group)) ids.push(t.group);
  const orderOf = (g: string) => {
    const i = GROUP_ORDER.indexOf(g as ToolGroup);
    return i === -1 ? GROUP_ORDER.length : i;
  };
  ids.sort((a, b) => orderOf(a) - orderOf(b));
  return ids.map((id) => ({ id, ...groupMeta(id) }));
}

export const toolById = (id: string): Tool | undefined =>
  assistantCatalog().find((t) => t.id === id);

// Generalist agents get every tool; otherwise the union of their skills' tools.
export function toolsForAgent(agent: Agent | undefined, skills: Skill[]): Tool[] {
  const catalog = assistantCatalog();
  if (!agent) return [];
  if (agent.allTools) return catalog.slice();
  const ids = new Set<string>();
  for (const sid of agent.skills) {
    const s = skills.find((x) => x.id === sid);
    s?.tools.forEach((tid) => ids.add(tid));
  }
  return catalog.filter((t) => ids.has(t.id));
}
