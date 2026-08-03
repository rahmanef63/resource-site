"use client";

import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import type { NavGroup } from "../lib/types";
import { TileGrid } from "./mobile-menu-tiles";

export interface MobileMenuDrawerProps {
  groups: NavGroup[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pathname: string;
  title?: ReactNode;
  description?: ReactNode;
}

/**
 * The mobile face of the sidebar: a bottom drawer of THUMBNAIL TILES, not a
 * list. An item with sub-items drills down in place (one level) instead of
 * nesting, so every tap target stays thumb-sized. This is the only mobile
 * navigation surface — the rail is not rendered under `md`, so a phone never
 * gets a sheet-shaped copy of the desktop sidebar.
 */
export function MobileMenuDrawer({
  groups,
  open,
  onOpenChange,
  pathname,
  title = "Menu",
  description,
}: MobileMenuDrawerProps) {
  const [drillId, setDrillId] = useState<string | null>(null);
  const drill = drillId
    ? groups.flatMap((g) => g.items).find((i) => i.id === drillId)
    : undefined;

  const close = () => {
    onOpenChange(false);
    setDrillId(null);
  };

  return (
    <Drawer
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setDrillId(null);
      }}
    >
      <DrawerContent className="max-h-[85svh]">
        <DrawerHeader className="flex-row items-center gap-2 pb-2 text-left">
          {drill ? (
            <Button
              variant="ghost"
              size="icon"
              className="-ml-1 size-8 shrink-0"
              aria-label="Back"
              onClick={() => setDrillId(null)}
            >
              <ChevronLeft className="size-4" />
            </Button>
          ) : null}
          <div className="min-w-0">
            <DrawerTitle className="truncate text-base">
              {drill ? drill.label : title}
            </DrawerTitle>
            {description && !drill ? (
              <DrawerDescription className="truncate">{description}</DrawerDescription>
            ) : null}
          </div>
        </DrawerHeader>

        <div className="min-h-0 overflow-y-auto px-3 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
          {drill ? (
            <TileGrid items={drill.items ?? []} pathname={pathname} onDone={close} />
          ) : (
            groups.map((group) => (
              <section key={group.id} className="mb-4 last:mb-0">
                {group.label ? (
                  <p className="px-1 pb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    {group.label}
                  </p>
                ) : null}
                <TileGrid
                  items={group.items}
                  pathname={pathname}
                  onDone={close}
                  onDrill={setDrillId}
                />
              </section>
            ))
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
