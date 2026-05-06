import type { WidgetConfig } from '@/frontend/slices/studio/ui/types';
import { cn } from '@/lib/utils';
import React from 'react';

// Static lookup tables — Tailwind v4 requires complete class strings (no dynamic fragments)
const TW = {
  justify: { start: "justify-start", center: "justify-center", between: "justify-between", end: "justify-end", around: "justify-around", evenly: "justify-evenly" },
  items: { start: "items-start", center: "items-center", end: "items-end", stretch: "items-stretch" },
  gap: { '0':'gap-0','1':'gap-1','2':'gap-2','3':'gap-3','4':'gap-4','5':'gap-5','6':'gap-6','8':'gap-8','10':'gap-10','12':'gap-12' } as Record<string,string>,
  p:   { '0':'p-0','1':'p-1','2':'p-2','3':'p-3','4':'p-4','5':'p-5','6':'p-6','8':'p-8','10':'p-10','12':'p-12' } as Record<string,string>,
  m:   { '0':'m-0','1':'m-1','2':'m-2','3':'m-3','4':'m-4','5':'m-5','6':'m-6','8':'m-8','10':'m-10','12':'m-12','auto':'m-auto' } as Record<string,string>,
  w: { auto: "w-auto", full: "w-full", screen: "w-screen" },
  h: { auto: "h-auto", full: "h-full", screen: "h-screen" },
  pos: { static: "static", relative: "relative", absolute: "absolute", fixed: "fixed", sticky: "sticky" },
} as const;

export const containerManifest: WidgetConfig = {
  label: "Container",
  category: "Layout",
  description: "A flexible container for layout and routing.",
  icon: "Container",
  defaults: { 
    path: "/", // route when linked from a Menu
    display: "flex", // flex | block
    direction: "col", // col | row
    justify: "start", // start | center | between | end | around | evenly
    items: "start", // start | center | end | stretch
    gap: "4", // tailwind scale
    p: "6",
    m: "0",
    w: "full", // auto | full | screen
    h: "auto", // auto | full | screen
    position: "static", // static|relative|absolute|fixed|sticky
    className: "max-w-6xl mx-auto",
  },
  render: (p, children) => {
    const cls = cn(
      p.className,
      p.display === "flex" ? "flex" : "block",
      p.display === "flex" && (p.direction === "row" ? "flex-row" : "flex-col"),
      p.display === "flex" && TW.justify[p.justify as keyof typeof TW.justify],
      p.display === "flex" && TW.items[p.items as keyof typeof TW.items],
      TW.gap[p.gap],
      TW.p[p.p],
      TW.m[p.m],
      TW.w[p.w as keyof typeof TW.w],
      TW.h[p.h as keyof typeof TW.h],
      TW.pos[p.position as keyof typeof TW.pos]
    );
    return <div className={cls}>{children}</div>;
  },
  inspector: {
    fields: [
      {
        key: 'path',
        label: 'Route Path',
        type: 'text',
        placeholder: '/'
      },
      {
        key: 'display',
        label: 'Display',
        type: 'select',
        options: ['flex', 'block']
      },
      {
        key: 'direction',
        label: 'Direction (flex)',
        type: 'select',
        options: ['col', 'row']
      },
      {
        key: 'justify',
        label: 'Justify (flex)',
        type: 'select',
        options: ["start", "center", "between", "end", "around", "evenly"]
      },
      {
        key: 'items',
        label: 'Align Items (flex)',
        type: 'select',
        options: ["start", "center", "end", "stretch"]
      },
      {
        key: 'gap',
        label: 'Gap',
        type: 'select',
        options: ['0', '1', '2', '3', '4', '5', '6', '8', '10', '12']
      },
      {
        key: 'p',
        label: 'Padding',
        type: 'select',
        options: ['0', '1', '2', '3', '4', '5', '6', '8', '10', '12']
      },
      {
        key: 'className',
        label: 'Custom CSS Classes',
        type: 'text',
        placeholder: 'Additional CSS classes'
      }
    ]
  }
};
