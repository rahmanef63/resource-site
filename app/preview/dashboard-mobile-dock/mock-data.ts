import {
  Bell, CalendarDays, Clock, CircleCheck, Cog, Folder, Home, Search, User,
} from "lucide-react";

export const TAB_POOL = {
  home: { id: "home", label: "Home", icon: Home },
  tasks: { id: "tasks", label: "Tasks", icon: CalendarDays },
  alerts: { id: "alerts", label: "Alerts", icon: Bell },
  me: { id: "me", label: "Me", icon: User },
  search: { id: "search", label: "Search", icon: Search },
  files: { id: "files", label: "Files", icon: Folder },
  settings: { id: "settings", label: "Settings", icon: Cog },
};

export type TabKey = keyof typeof TAB_POOL;

export const ALL_TABS: TabKey[] = ["home", "tasks", "alerts", "me", "search", "files", "settings"];

export const PROGRESS_ROWS = [
  { title: "Wireframe v2",      sub: "Design",     icon: Clock,       state: "amber" as const },
  { title: "Convex auth merge", sub: "Backend",    icon: CircleCheck, state: "green" as const },
  { title: "Send weekly recap", sub: "Marketing",  icon: Clock,       state: "amber" as const },
];
