"use client";
/** Variant preview (VP wave) — rr-internal, stripped on `rr add`. */

import * as React from "react";
import { FileText, Plus, Search, Settings } from "lucide-react";
import type { SlicePreviewModule } from "@/shared/preview/types";
import { Command, CommandInput, CommandList, CommandEmpty } from "@/components/ui/command";
import { CommandGroupList } from "./components/palette/CommandGroups";
import type { CommandGroup } from "./lib/types";

const noop = () => {};

const PAGES: CommandGroup = {
  id: "pages",
  heading: "Pages",
  items: [
    { id: "p-roadmap", value: "page:Roadmap:p-roadmap", label: "Roadmap", icon: <FileText className="mr-2 h-3.5 w-3.5 text-muted-foreground" />, onSelect: noop },
    { id: "p-notes", value: "page:Meeting notes:p-notes", label: "Meeting notes", icon: <FileText className="mr-2 h-3.5 w-3.5 text-muted-foreground" />, onSelect: noop },
  ],
};

const COMMANDS: CommandGroup = {
  id: "commands",
  heading: "Commands",
  items: [
    { id: "c-new", value: "cmd:New page:c-new", label: "New page", icon: <Plus className="mr-2 h-3.5 w-3.5 text-muted-foreground" />, onSelect: noop },
    { id: "c-search", value: "cmd:Search workspace:c-search", label: "Search workspace", icon: <Search className="mr-2 h-3.5 w-3.5 text-muted-foreground" />, onSelect: noop },
    { id: "c-settings", value: "cmd:Settings:c-settings", label: "Settings", icon: <Settings className="mr-2 h-3.5 w-3.5 text-muted-foreground" />, onSelect: noop },
  ],
};

const CommandPreview: SlicePreviewModule["CommandPalette"] = ({ variant }) => {
  const [query, setQuery] = React.useState("");
  const groups = variant.scope === "commands" ? [COMMANDS] : [PAGES, COMMANDS];
  const run = (fn: () => void | Promise<void>) => () => void fn();

  return (
    <div className="p-4">
      <div className="overflow-hidden rounded-lg border border-border shadow-sm">
        <Command shouldFilter className="bg-popover">
          <CommandInput
            placeholder="Search pages or run a command…"
            value={query}
            onValueChange={setQuery}
          />
          <CommandList className="max-h-[320px]">
            <CommandEmpty>No results.</CommandEmpty>
            <CommandGroupList groups={groups} query={query} run={run} />
          </CommandList>
        </Command>
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">
        Rendered inline (open) — type to fuzzy-filter. In-app it mounts as a ⌘K dialog.
      </p>
    </div>
  );
};

const preview: SlicePreviewModule = { CommandPalette: CommandPreview };
export default preview;
