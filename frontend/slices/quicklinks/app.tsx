"use client";

import { useState } from "react";
import { Globe, Link2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppFrame } from "./components/app-frame";
import { useQuicklinks, faviconUrl, openQuicklink } from "./lib/host";

// Quicklinks window: a grid of favicon tiles, click opens a new tab. An inline
// row adds a URL and each tile reveals a remove control on hover/focus. Data is
// the configured quicklinks store (localStorage-backed by default — see
// lib/host.ts; hosts inject their own via configureQuicklinks()).
export default function QuicklinksApp() {
  const { items, add, remove } = useQuicklinks();
  const [url, setUrl] = useState("");

  const submit = () => {
    const value = url.trim();
    if (!value) return;
    add(value);
    setUrl("");
  };

  return (
    <AppFrame>
      <div className="flex items-center gap-2 border-b border-border p-3">
        <Input
          type="url"
          inputMode="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder="Add a website URL"
          aria-label="Website URL to add"
          className="flex-1"
        />
        <Button
          type="button"
          size="sm"
          onClick={submit}
          disabled={!url.trim()}
          aria-label="Add quicklink"
          className="gap-1.5"
        >
          <Plus className="size-4" /> Add
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="grid flex-1 place-items-center p-6 text-center">
          <div className="space-y-2 text-muted-foreground">
            <Link2 className="mx-auto size-8" />
            <p className="text-sm font-medium text-foreground">No quicklinks yet</p>
            <p className="text-xs">Add a website shortcut above to get started.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4 p-5 @sm:grid-cols-4 @md:grid-cols-5">
          {items.map((ql) => {
            const src = faviconUrl(ql.url);
            return (
              <div key={ql.id} className="group relative">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => openQuicklink(ql)}
                  title={ql.title}
                  aria-label={`Open ${ql.title}`}
                  className="flex h-auto w-full flex-col items-center gap-2 p-2"
                >
                  <span className="grid size-16 place-items-center overflow-hidden rounded-2xl bg-white text-zinc-500 shadow-md ring-1 ring-black/10 transition-transform group-hover:scale-105">
                    {src ? (
                      // eslint-disable-next-line @next/next/no-img-element -- dynamic remote favicon host
                      <img src={src} alt="" width={36} height={36} className="size-9 object-contain" />
                    ) : (
                      <Globe className="size-8" />
                    )}
                  </span>
                  <span className="max-w-full truncate text-xs font-medium">{ql.title}</span>
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={() => remove(ql.id)}
                  title={`Remove ${ql.title}`}
                  aria-label={`Remove ${ql.title}`}
                  className="absolute right-0 top-0 size-6 rounded-full opacity-0 shadow transition-opacity focus-visible:opacity-100 group-hover:opacity-100 group-focus-within:opacity-100"
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </AppFrame>
  );
}
