"use client";

import { useMemo, useState } from "react";
import { Check, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Segmented } from "./segmented";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GLYPH_KEYS } from "../lib/glyph";
import { APP_GRADIENTS, APP_RUNTIMES, DEFAULT_ENTRY, appManifestJson, slugifyAppName, type AppRuntime } from "../lib/create-core";
import { createApp } from "../lib/apps-store";
import { usePublishInspector } from "../lib/host";
import { cn } from "@/lib/utils";
import { IconPreview } from "./icon-preview";
import { GlyphPicker } from "./glyph-picker";

// Create App — author a new os-rr app and persist it via Convex. On create the
// app is installed; the shell's dynamic registry shows it in the dock instantly.
export default function CreateApp() {
  const [name, setName] = useState("");
  const [runtime, setRuntime] = useState<AppRuntime>("html");
  const [entry, setEntry] = useState(DEFAULT_ENTRY.html);
  const [gradient, setGradient] = useState<string>(APP_GRADIENTS[0]);
  const [glyph, setGlyph] = useState<string>(GLYPH_KEYS[0]);
  const [created, setCreated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slug = useMemo(() => slugifyAppName(name) || "untitled", [name]);
  const manifest = useMemo(
    () => appManifestJson({ name, runtime, entry, glyph, gradient }),
    [name, runtime, entry, glyph, gradient],
  );

  const pickRuntime = (r: AppRuntime) => {
    setRuntime(r);
    setEntry(DEFAULT_ENTRY[r]);
  };

  // Surface the draft to the shell AI Inspector.
  usePublishInspector(
    "create-app",
    {
      subject: name.trim() || "New app",
      props: [
        { label: "Name", value: name.trim() || "—" },
        { label: "Slug", value: slug },
        { label: "Runtime", value: runtime },
        { label: "Entry", value: entry },
      ],
      context: `Creating app ${name.trim() || "untitled"} (${runtime})`,
      suggestions: ["Suggest a name", "What runtime should I use?", "Write a description"],
    },
    [name, slug, runtime, entry],
  );

  const handleCreate = async () => {
    if (created) return;
    setError(null);
    try {
      createApp({ appId: slug, title: name, glyph, gradient, runtime, entry });
      setCreated(true);
      setTimeout(() => {
        setName("");
        pickRuntime("html");
        setGradient(APP_GRADIENTS[0]);
        setGlyph(GLYPH_KEYS[0]);
        setCreated(false);
      }, 1800);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal membuat app");
    }
  };

  return (
    <ScrollArea className="h-full">
      <div className="mx-auto max-w-md space-y-5 p-5">
        <header className="flex items-center gap-3">
          <IconPreview glyph={glyph} gradient={gradient} />
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold">{name.trim() || "New app"}</h2>
            <p className="truncate font-mono text-[11px] text-muted-foreground">/apps/{slug}</p>
          </div>
        </header>

        <Separator />

        <Field label="Name">
          <Input aria-label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="My App" autoFocus />
        </Field>

        <Field label="Runtime">
          <Segmented options={APP_RUNTIMES} value={runtime} onChange={pickRuntime} className="w-full" />
        </Field>

        <Field label="Entry point">
          <Input aria-label="Entry point" value={entry} onChange={(e) => setEntry(e.target.value)} className="font-mono text-xs" />
        </Field>

        <Field label="Glyph">
          <GlyphPicker value={glyph} onChange={setGlyph} />
        </Field>

        <Field label="Accent">
          <div className="flex gap-2">
            {APP_GRADIENTS.map((g) => (
              <Button
                key={g}
                type="button"
                variant="ghost"
                size="icon"
                aria-label="accent"
                onClick={() => setGradient(g)}
                style={{ background: g }}
                className={cn(
                  "size-7 rounded-full p-0 ring-offset-2 ring-offset-background transition",
                  gradient === g ? "ring-2 ring-primary" : "ring-1 ring-border hover:ring-foreground/40",
                )}
              />
            ))}
          </div>
        </Field>

        <Field label="manifest.json">
          <pre className="overflow-x-auto rounded-md border border-border bg-secondary/50 p-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
            {manifest}
          </pre>
        </Field>

        <Button className="w-full" disabled={created} onClick={handleCreate}>
          {created ? (
            <>
              <Check className="size-4" /> Created
            </>
          ) : (
            <>
              <Rocket className="size-4" /> Create app
            </>
          )}
        </Button>

        {error && <p className="text-center text-xs text-destructive">{error}</p>}

        {created && (
          <div className="flex justify-center">
            <Badge variant="secondary">
              <Check className="size-3" /> Added to dock
            </Badge>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}
