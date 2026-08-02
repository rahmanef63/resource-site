import {
  AudioWaveform, BookOpen, Bot, Command, Frame, GalleryVerticalEnd,
  Map as MapIcon, PieChart, Settings2, SquareTerminal, type LucideIcon,
} from "lucide-react";

export type NavSub = { title: string };
export type NavItem = { title: string; icon: LucideIcon; items: NavSub[] };
export type Workspace = {
  id: string;
  name: string;
  logo: LucideIcon;
  plan: string;
  /** This workspace's default menuSet — NavContext pairs it atomically. */
  nav: NavItem[];
};

export const USER = { name: "Rahman", email: "casa@rahmanef.com" };

export const WORKSPACES: Workspace[] = [
  {
    id: "acme", name: "Acme HQ", logo: GalleryVerticalEnd, plan: "Enterprise",
    nav: [
      { title: "Platform", icon: SquareTerminal, items: [{ title: "Dashboard" }, { title: "Analytics" }, { title: "Reports" }] },
      { title: "Models", icon: Bot, items: [{ title: "Genesis" }, { title: "Explorer" }] },
      { title: "Docs", icon: BookOpen, items: [{ title: "Introduction" }, { title: "Get Started" }] },
      { title: "Settings", icon: Settings2, items: [{ title: "General" }, { title: "Team" }, { title: "Billing" }] },
    ],
  },
  {
    id: "beta", name: "Beta Labs", logo: AudioWaveform, plan: "Startup",
    nav: [
      { title: "Projects", icon: Frame, items: [{ title: "Roadmap" }, { title: "Sprints" }] },
      { title: "Insights", icon: PieChart, items: [{ title: "Funnels" }, { title: "Cohorts" }] },
      { title: "Settings", icon: Settings2, items: [{ title: "General" }, { title: "Members" }] },
    ],
  },
  {
    id: "solo", name: "Personal", logo: Command, plan: "Free",
    nav: [
      { title: "Home", icon: SquareTerminal, items: [{ title: "Dashboard" }, { title: "Notes" }] },
      { title: "Maps", icon: MapIcon, items: [{ title: "Saved" }] },
    ],
  },
];

// Fork = a personal copy of a workspace menuSet (here: keep the first two
// groups, owned by the user — `source: user` in NavContext terms).
export function forkOf(ws: Workspace): NavItem[] {
  return ws.nav.slice(0, 2);
}
