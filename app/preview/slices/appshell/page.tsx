"use client";

import { useEffect } from "react";
import { FileText, Info, Rocket } from "lucide-react";
import {
  AppShell,
  openWindow,
  searchFeature,
  inspectorFeature,
  notificationsFeature,
  controlCenterFeature,
  widgetsFeature,
  type ShellManifest,
} from "@/features/appshell";
import "@/features/appshell/appshell.css";

// Live preview: the appshell mounted with a tiny demo manifest — 3 stub apps +
// the 5 bundled shell features. Drag/snap/maximize windows, ⌘K Spotlight, dock
// click-to-focus + hover switcher. routing:false so the iframe URL stays put.

function NotesApp() {
  return (
    <div className="flex h-full flex-col bg-background p-4">
      <textarea
        defaultValue={"# Notes\n\nDrag this window. Drag it to a screen edge to snap.\nDouble-click the title bar to maximize. ⌘K for Spotlight."}
        className="h-full w-full resize-none bg-transparent text-sm outline-none"
      />
    </div>
  );
}

function AboutApp() {
  return (
    <div className="grid h-full place-items-center bg-background p-6 text-center">
      <div>
        <h2 className="text-lg font-semibold">AppShell</h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          A manifest-driven desktop + mobile OS shell. This whole desktop is one
          slice — <code>rr add appshell</code>. Apps, brand, and capabilities are
          injected via the manifest; the window manager, dock, menu bar, and
          mobile surface are generic.
        </p>
      </div>
    </div>
  );
}

function WelcomeApp() {
  return (
    <div className="flex h-full flex-col gap-2 bg-background p-5 text-sm">
      <p className="font-semibold">Try it:</p>
      <ul className="ml-4 list-disc space-y-1 text-muted-foreground">
        <li>Click a dock icon to open / focus an app</li>
        <li>Hover a running dock icon → switch between its windows</li>
        <li>Drag a window to a screen edge to snap; double-click the title bar to maximize</li>
        <li>Press ⌘K for Spotlight, ⌘I for the AI Inspector</li>
        <li>Resize the frame narrow → the mobile (iOS-style) surface takes over</li>
      </ul>
    </div>
  );
}

const apps: ShellManifest["apps"] = [
  {
    id: "notes",
    title: "Notes",
    icon: FileText,
    gradient: "linear-gradient(160deg,#ffd34d,#ff9a3d)",
    defaultSize: { w: 560, h: 380 },
    multi: true,
    load: async () => ({ default: NotesApp }),
  },
  {
    id: "welcome",
    title: "Welcome",
    icon: Rocket,
    gradient: "linear-gradient(160deg,#6a8dff,#7a5bff)",
    defaultSize: { w: 520, h: 360 },
    load: async () => ({ default: WelcomeApp }),
  },
  {
    id: "about",
    title: "About",
    icon: Info,
    gradient: "linear-gradient(160deg,#5be0c8,#2f9bff)",
    defaultSize: { w: 460, h: 300 },
    load: async () => ({ default: AboutApp }),
  },
];

// Stable references: capability hooks must return the SAME object across
// renders (real consumers back these with a store/memo). An inline object
// literal would change identity every render → setState-in-effect loop.
const NOOP = () => {};
const APPEARANCE = { theme: "light" as const, setTheme: NOOP, device: "auto" as const, wallpaper: "aurora" };

const demoManifest: ShellManifest = {
  brand: { name: "AppShell", logo: "▲", idleAppName: "Finder" },
  apps,
  features: [
    searchFeature,
    inspectorFeature,
    notificationsFeature,
    controlCenterFeature,
    widgetsFeature,
  ],
  routing: false,
  capabilities: {
    useAppearance: () => APPEARANCE,
    useCpuPercent: () => null,
  },
};

export default function Page() {
  // Land on an open window so the preview reads as a live OS, not a bare desktop.
  useEffect(() => {
    openWindow("welcome", "Welcome", { w: 520, h: 360 });
  }, []);
  return <AppShell manifest={demoManifest} />;
}
