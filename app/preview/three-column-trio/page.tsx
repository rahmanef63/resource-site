"use client";

import * as React from "react";
import { Suspense } from "react";
import { Inbox, FileText, Bookmark, Settings, ChevronRight, Plus, Save, ArrowRight } from "lucide-react";
import {
  ThreeColumnLayoutAdvanced,
  PanelSection,
  PanelGroup,
  PanelGroupLabel,
  PanelMenu,
  PanelMenuItem,
  PanelMenuButton,
  PanelSeparator,
} from "@/components/previews/three-column";
import { Button } from "@/components/ui/button";

/**
 * V-wave demo — PanelSection trio (Header / Items / Footer) wired into
 * all three columns + layout-level footer slots. Proves:
 *   1. Trigger renders ABOVE PanelSection.Header (V-wave separation).
 *   2. Footer slots pin to bottom via flex-shrink-0 + border-top.
 *   3. Center column uses `unstyled` to drop sidebar fill (content surface).
 *   4. PanelMenu + PanelGroup + PanelSeparator primitives render correctly.
 */

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Demo />
    </Suspense>
  );
}

function Demo() {
  const [active, setActive] = React.useState("inbox");

  return (
    <main className="h-screen bg-background">
      <ThreeColumnLayoutAdvanced
        preset="feature"
        storageKey="trio-demo-layout"
        persistState
        leftLabel="Folders"
        rightLabel="Details"
        leftFooter={
          <Button variant="ghost" size="sm" className="h-7 w-full justify-start text-xs">
            <Plus className="mr-2 h-3 w-3" /> New folder
          </Button>
        }
        centerFooter={
          <div className="flex w-full items-center justify-between">
            <span className="text-xs text-muted-foreground">Auto-saved 2s ago</span>
            <Button size="sm" className="h-7">
              <Save className="mr-2 h-3 w-3" /> Save draft
            </Button>
          </div>
        }
        rightFooter={
          <Button size="sm" className="h-7 w-full">
            Apply changes
            <ArrowRight className="ml-2 h-3 w-3" />
          </Button>
        }
        left={
          <PanelSection label="Folders">
            <PanelSection.Header>
              <span className="text-sm font-medium">Workspace</span>
            </PanelSection.Header>
            <PanelSection.Items>
              <PanelGroup>
                <PanelGroupLabel>Inbox</PanelGroupLabel>
                <PanelMenu>
                  {[
                    { id: "inbox", label: "All mail", icon: Inbox, count: 24 },
                    { id: "drafts", label: "Drafts", icon: FileText, count: 3 },
                    { id: "saved", label: "Saved", icon: Bookmark, count: 12 },
                  ].map((row) => (
                    <PanelMenuItem key={row.id}>
                      <PanelMenuButton isActive={active === row.id} onClick={() => setActive(row.id)}>
                        <row.icon className="h-4 w-4" />
                        <span className="flex-1 truncate">{row.label}</span>
                        <span className="ml-auto text-xs text-sidebar-foreground/60">{row.count}</span>
                      </PanelMenuButton>
                    </PanelMenuItem>
                  ))}
                </PanelMenu>
              </PanelGroup>
              <PanelSeparator />
              <PanelGroup>
                <PanelGroupLabel>Account</PanelGroupLabel>
                <PanelMenu>
                  <PanelMenuItem>
                    <PanelMenuButton isActive={active === "settings"} onClick={() => setActive("settings")}>
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </PanelMenuButton>
                  </PanelMenuItem>
                </PanelMenu>
              </PanelGroup>
            </PanelSection.Items>
            <PanelSection.Footer>
              <div className="text-[11px] text-sidebar-foreground/60">3 folders · 39 items</div>
            </PanelSection.Footer>
          </PanelSection>
        }
        center={
          <PanelSection unstyled label="Editor">
            <PanelSection.Header className="border-b border-border bg-background">
              <div className="flex w-full items-center justify-between">
                <h2 className="text-sm font-semibold capitalize">{active}</h2>
                <span className="text-xs text-muted-foreground">Draft</span>
              </div>
            </PanelSection.Header>
            <PanelSection.Items className="p-6">
              <div className="mx-auto max-w-prose space-y-4">
                <h1 className="text-2xl font-semibold capitalize">{active} view</h1>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  This center column uses <code className="rounded bg-muted px-1.5 py-0.5 text-xs">unstyled</code> on
                  PanelSection so the sidebar tokens drop and the content sits on the regular background. The chrome
                  border on Header is also swapped to <code className="rounded bg-muted px-1.5 py-0.5 text-xs">border</code>
                  +<code className="rounded bg-muted px-1.5 py-0.5 text-xs">bg-background</code> per the
                  three-column-layout.md spec for center columns.
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Scroll long content here — the Items wrapper has
                  <code className="ml-1 rounded bg-muted px-1.5 py-0.5 text-xs">flex-1 min-h-0 overflow-auto</code> so
                  the footer below stays pinned and the header stays sticky-shaped.
                </p>
                {Array.from({ length: 8 }).map((_, i) => (
                  <p key={i} className="text-sm leading-relaxed text-muted-foreground">
                    Filler paragraph {i + 1}. Trigger sits above the Header chrome (V-wave separation rule). Resize
                    the left/right columns by dragging their edges. Toggle them collapsed via the trigger icons.
                  </p>
                ))}
              </div>
            </PanelSection.Items>
            <PanelSection.Footer className="border-t border-border bg-background">
              <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
                <span>Last saved · 14:32</span>
                <span>Words: 142</span>
              </div>
            </PanelSection.Footer>
          </PanelSection>
        }
        right={
          <PanelSection label="Inspector">
            <PanelSection.Header>
              <span className="text-sm font-medium">Inspector</span>
            </PanelSection.Header>
            <PanelSection.Items>
              <PanelGroup>
                <PanelGroupLabel>Properties</PanelGroupLabel>
                <div className="px-2 text-xs text-sidebar-foreground/80">
                  <Row k="Status" v="Draft" />
                  <Row k="Owner" v="rahman" />
                  <Row k="Tags" v="design, demo" />
                  <Row k="Created" v="May 18, 2026" />
                </div>
              </PanelGroup>
              <PanelSeparator />
              <PanelGroup>
                <PanelGroupLabel>Related</PanelGroupLabel>
                <PanelMenu>
                  {["Spec doc", "Figma file", "Linear ticket"].map((label) => (
                    <PanelMenuItem key={label}>
                      <PanelMenuButton>
                        <ChevronRight className="h-4 w-4" />
                        <span>{label}</span>
                      </PanelMenuButton>
                    </PanelMenuItem>
                  ))}
                </PanelMenu>
              </PanelGroup>
            </PanelSection.Items>
            <PanelSection.Footer>
              <div className="text-[11px] text-sidebar-foreground/60">4 properties · 3 links</div>
            </PanelSection.Footer>
          </PanelSection>
        }
      />
    </main>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sidebar-foreground/60">{k}</span>
      <span className="text-sidebar-foreground">{v}</span>
    </div>
  );
}
