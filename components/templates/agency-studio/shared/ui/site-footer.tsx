"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { IconBrandLinkedin, IconBrandX, IconBrandInstagram, IconBrandDribbble } from "@tabler/icons-react";
import { Separator } from "@/components/ui/separator";
import { DEFAULT_SITE_CONFIG } from "../site-config";
import { PUBLIC_BASE, PUBLIC_NAV } from "./site-nav";

export function SiteFooter() {
  const c = DEFAULT_SITE_CONFIG;
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link href={PUBLIC_BASE} className="flex items-center gap-2 font-semibold">
            <span className="grid size-7 place-items-center rounded-md bg-foreground text-background">{c.brandLetter}</span>
            <span>{c.brandName}</span>
          </Link>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">{c.description}</p>
          <div className="mt-4 flex items-center gap-2">
            {[IconBrandX, IconBrandLinkedin, IconBrandInstagram, IconBrandDribbble].map((Icon, i) => (
              <a key={i} href="#" className="grid size-9 place-items-center rounded-full border border-border/60 text-muted-foreground hover:bg-accent hover:text-foreground">
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Studio</p>
          <ul className="mt-3 space-y-2 text-sm">
            {PUBLIC_NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="text-muted-foreground hover:text-foreground">{n.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Office</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>{c.email}</li>
            <li>Founded {c.studioFounded}</li>
            <li>Jakarta · remote-first</li>
          </ul>
        </div>
      </div>
      <Separator />
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-6 py-5 text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} {c.studioName}. All rights reserved.</p>
        <p className="inline-flex items-center gap-1">
          Built with <span className="font-medium text-foreground">Agency Studio OS</span>
          <ChevronRight className="size-3" />
        </p>
      </div>
    </footer>
  );
}
