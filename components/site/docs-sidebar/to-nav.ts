import {
  Blocks,
  BookOpen,
  Bot,
  Boxes,
  Compass,
  Database,
  FileText,
  FolderTree,
  History,
  KeyRound,
  Layers,
  Layout,
  Plug,
  Rocket,
  Server,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import type { NavGroup, NavIcon, NavItem } from "@/features/dashboard-shell";
import type { NavSection } from "./nav-types";

/** Tile icons — a docs entry has no icon of its own, and a grid of letters is
 *  not a thumbnail. Keyed by the label the catalog builder emits. */
const ICONS: Record<string, NavIcon> = {
  // clusters
  "Get Started": Rocket,
  Slices: Boxes,
  Standards: ShieldCheck,
  Automation: Bot,
  Releases: History,
  // get-started leaves
  Introduction: BookOpen,
  Installation: Wrench,
  Architecture: Layers,
  Stack: Blocks,
  Directory: FolderTree,
  // slice categories
  "All slices": Boxes,
  Auth: KeyRound,
  Integrations: Plug,
  AI: Bot,
  Data: Database,
  Content: FileText,
  UI: Layout,
  "OS Apps": Server,
  Infra: Compass,
};

function iconFor(label: string): NavIcon | undefined {
  return ICONS[label];
}

/**
 * Docs catalog → the dashboard-shell nav shape, so the mobile menu drawer can
 * render the docs tree as thumbnail tiles instead of a sidebar list.
 *
 * A branch keeps its children (the drawer drills one level into them); a leaf
 * becomes a plain link tile. Branches carry no href on purpose — tapping one
 * must open its tiles, not navigate.
 */
export function sectionsToNav(sections: NavSection[]): NavGroup[] {
  return sections.map((section) => ({
    id: section.label,
    label: section.label,
    items: section.items.map((node): NavItem =>
      node.kind === "leaf"
        ? {
            id: node.href,
            label: node.title,
            href: node.href,
            icon: iconFor(node.title),
            exact: true,
            badge: node.badge,
          }
        : {
            id: `${section.label}:${node.title}`,
            label: node.title,
            icon: iconFor(node.title),
            badge: node.badge,
            items: node.items.map((leaf) => ({
              id: leaf.href,
              label: leaf.title,
              href: leaf.href,
              exact: true,
              badge: leaf.badge,
            })),
          },
    ),
  }));
}
