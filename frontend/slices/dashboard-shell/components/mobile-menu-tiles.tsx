"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isActive } from "../lib/nav";
import type { NavItem } from "../lib/types";

/** Thumbnail grid — the mobile stand-in for a sidebar list. */
export function TileGrid({
  items,
  pathname,
  onDone,
  onDrill,
}: {
  items: NavItem[];
  pathname: string;
  onDone: () => void;
  onDrill?: (id: string) => void;
}) {
  if (!items.length) {
    return <p className="px-1 py-4 text-xs text-muted-foreground">Nothing here.</p>;
  }

  return (
    <div className="grid grid-cols-4 gap-1">
      {items.map((item) => (
        <Tile
          key={item.id}
          item={item}
          active={isActive(pathname, item)}
          onDone={onDone}
          onDrill={onDrill}
        />
      ))}
    </div>
  );
}

export function Tile({
  item,
  active,
  onDone,
  onDrill,
}: {
  item: NavItem;
  active: boolean;
  onDone: () => void;
  onDrill?: (id: string) => void;
}) {
  const Icon = item.icon;
  // A parent whose children carry the real destinations drills down instead of
  // navigating — but only when it has no destination of its own.
  const drills = !!onDrill && !!item.items?.length && !item.href && !item.onSelect;

  const body = (
    <>
      <span
        className={cn(
          "grid size-14 shrink-0 place-items-center rounded-2xl border bg-muted/40 transition",
          active && "border-primary/40 bg-primary/10 text-primary",
        )}
      >
        {Icon ? (
          <Icon className="size-6" />
        ) : (
          <span className="text-base font-semibold">{item.label.slice(0, 1)}</span>
        )}
      </span>
      <span className={cn("line-clamp-2 text-[11px] leading-tight", active && "font-medium text-foreground")}>
        {item.label}
      </span>
      {item.badge ? (
        <span className="absolute right-1 top-1 rounded-full bg-primary px-1.5 text-[10px] font-medium text-primary-foreground">
          {item.badge}
        </span>
      ) : null}
    </>
  );

  const className = "relative flex h-auto flex-col items-center gap-1.5 rounded-xl p-2 text-center font-normal whitespace-normal";

  if (item.href) {
    return (
      <Button asChild variant="ghost" className={className} onClick={onDone}>
        <Link href={item.href} aria-current={active ? "page" : undefined}>
          {body}
        </Link>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      className={className}
      onClick={() => {
        if (drills) return onDrill!(item.id);
        item.onSelect?.();
        onDone();
      }}
    >
      {body}
    </Button>
  );
}
