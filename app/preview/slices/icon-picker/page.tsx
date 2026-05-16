"use client";

import * as React from "react";
import { Search, Smile, Heart, Star, Bookmark, Flag, Bell, Camera, Cloud, Compass, Coffee, Crown, Diamond, Feather, Flame, Gift, Globe, Home, Image, Key, Leaf, Lightbulb, Lock, Map, Mic, Moon, Mountain, Music, Palette, Phone, Plane, Rocket, Snowflake, Sun, Trophy, Umbrella, Wand2, Zap, type LucideIcon } from "lucide-react";

const ICONS: { name: string; Icon: LucideIcon }[] = [
  { name: "smile", Icon: Smile }, { name: "heart", Icon: Heart }, { name: "star", Icon: Star }, { name: "bookmark", Icon: Bookmark },
  { name: "flag", Icon: Flag }, { name: "bell", Icon: Bell }, { name: "camera", Icon: Camera }, { name: "cloud", Icon: Cloud },
  { name: "compass", Icon: Compass }, { name: "coffee", Icon: Coffee }, { name: "crown", Icon: Crown }, { name: "diamond", Icon: Diamond },
  { name: "feather", Icon: Feather }, { name: "flame", Icon: Flame }, { name: "gift", Icon: Gift }, { name: "globe", Icon: Globe },
  { name: "home", Icon: Home }, { name: "image", Icon: Image }, { name: "key", Icon: Key }, { name: "leaf", Icon: Leaf },
  { name: "lightbulb", Icon: Lightbulb }, { name: "lock", Icon: Lock }, { name: "map", Icon: Map }, { name: "mic", Icon: Mic },
  { name: "moon", Icon: Moon }, { name: "mountain", Icon: Mountain }, { name: "music", Icon: Music }, { name: "palette", Icon: Palette },
  { name: "phone", Icon: Phone }, { name: "plane", Icon: Plane }, { name: "rocket", Icon: Rocket }, { name: "snowflake", Icon: Snowflake },
  { name: "sun", Icon: Sun }, { name: "trophy", Icon: Trophy }, { name: "umbrella", Icon: Umbrella }, { name: "wand2", Icon: Wand2 },
  { name: "zap", Icon: Zap },
];

export default function Page() {
  const [q, setQ] = React.useState("");
  const [picked, setPicked] = React.useState("rocket");
  const filtered = ICONS.filter((i) => i.name.includes(q.toLowerCase()));
  return (
    <main className="min-h-screen bg-background p-8">
      <header className="mb-6">
        <h1 className="text-xl font-bold">Icon picker</h1>
        <p className="text-xs text-muted-foreground">Lucide-backed picker with search. Picked: <span className="font-mono font-medium">{picked}</span></p>
      </header>
      <div className="mb-4 flex items-center gap-2 rounded-lg border border-border/60 bg-card px-3 py-2">
        <Search className="size-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search icons…"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <span className="text-[10px] text-muted-foreground">{filtered.length} / {ICONS.length}</span>
      </div>
      <div className="grid grid-cols-6 gap-2 rounded-lg border border-border/60 bg-card p-4 sm:grid-cols-8 lg:grid-cols-12">
        {filtered.map(({ name, Icon }) => {
          const active = picked === name;
          return (
            <button
              key={name}
              onClick={() => setPicked(name)}
              title={name}
              className={`grid aspect-square place-items-center rounded-md border transition ${active ? "border-primary/60 bg-primary/10 text-primary" : "border-transparent text-muted-foreground hover:border-border/60 hover:bg-muted/30 hover:text-foreground"}`}
            >
              <Icon className="size-5" />
            </button>
          );
        })}
      </div>
    </main>
  );
}
