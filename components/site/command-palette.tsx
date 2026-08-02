"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Compass, Boxes, Bot, Download, Sun, Moon } from "lucide-react";
import { IconBrandGithub as Github } from "@tabler/icons-react";
import { useTheme } from "next-themes";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { slices } from "@/lib/content/slices";
import { site } from "@/lib/content/site";

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const { setTheme } = useTheme();

  React.useEffect(() => {
    function down(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    }
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  function go(href: string) {
    setOpen(false);
    if (href.startsWith("http")) {
      window.open(href, "_blank", "noopener,noreferrer");
    } else {
      router.push(href);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex h-9 w-full items-center gap-2 rounded-md border border-input bg-background/40 px-3 text-sm text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground sm:w-64 lg:w-44 xl:w-64"
        aria-label="Search documentation"
      >
        <span className="min-w-0 flex-1 truncate text-left">Search documentation...</span>
        <kbd className="pointer-events-none hidden h-5 shrink-0 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:inline-flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Pages">
            <CommandItem onSelect={() => go("/")}>
              <BookOpen /> Home
            </CommandItem>
            <CommandItem onSelect={() => go("/docs")}>
              <BookOpen /> Docs
            </CommandItem>
            <CommandItem onSelect={() => go("/tour")}>
              <Compass /> Grand Tour
            </CommandItem>
            <CommandItem onSelect={() => go("/slices")}>
              <Boxes /> Slices
            </CommandItem>
            <CommandItem onSelect={() => go("/agents")}>
              <Bot /> Install with Agent
            </CommandItem>
            <CommandItem onSelect={() => go("/installation")}>
              <Download /> Installation
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Slices">
            {slices.map((s) => (
              <CommandItem key={s.slug} onSelect={() => go(`/slices/${s.slug}`)}>
                <Boxes /> {s.title}
                <span className="ml-auto text-xs text-muted-foreground">{s.category}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Theme">
            <CommandItem onSelect={() => { setTheme("light"); setOpen(false); }}>
              <Sun /> Light
            </CommandItem>
            <CommandItem onSelect={() => { setTheme("dark"); setOpen(false); }}>
              <Moon /> Dark
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="External">
            <CommandItem onSelect={() => go(site.repo)}>
              <Github /> GitHub repo
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
