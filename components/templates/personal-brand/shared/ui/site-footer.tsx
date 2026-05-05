"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandX,
  IconBrandYoutube,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { nid, useStore } from "../store";
import { DEFAULT_SITE_CONFIG } from "../site-config";
import { PUBLIC_BASE, PUBLIC_NAV } from "./site-nav";

export function SiteFooter() {
  const c = DEFAULT_SITE_CONFIG;
  const { dispatch } = useStore();
  const [email, setEmail] = React.useState("");

  function subscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) {
      toast.error("Email tidak valid");
      return;
    }
    dispatch({
      type: "subscriber.create",
      sub: { id: nid("sub"), email, status: "pending", source: "footer", ts: Date.now() },
    });
    toast.success("Cek email kamu untuk konfirmasi 👍");
    setEmail("");
  }

  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link href={PUBLIC_BASE} className="flex items-center gap-2 font-semibold">
            <span className="grid size-7 place-items-center rounded-md bg-foreground text-background">{c.brandLetter}</span>
            <span>{c.brandName}</span>
          </Link>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">{c.description}</p>
          <form onSubmit={subscribe} className="mt-4 flex max-w-md gap-2">
            <Input
              type="email"
              placeholder="kamu@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background"
            />
            <Button type="submit" size="sm">
              Subscribe <ArrowRight className="size-3.5" />
            </Button>
          </form>
          <div className="mt-4 flex items-center gap-2">
            {[IconBrandX, IconBrandLinkedin, IconBrandGithub, IconBrandYoutube].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="grid size-9 place-items-center rounded-full border border-border/60 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Site</p>
          <ul className="mt-3 space-y-2 text-sm">
            {PUBLIC_NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="text-muted-foreground hover:text-foreground">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Legal</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><a href="#" className="text-muted-foreground hover:text-foreground">Privacy</a></li>
            <li><a href="#" className="text-muted-foreground hover:text-foreground">Terms</a></li>
            <li><a href="#" className="text-muted-foreground hover:text-foreground">RSS</a></li>
            <li><a href="#" className="text-muted-foreground hover:text-foreground">llms.txt</a></li>
          </ul>
        </div>
      </div>
      <Separator />
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-6 py-5 text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} {c.ownerName}. All rights reserved.</p>
        <p className="inline-flex items-center gap-1">
          Built with <span className="font-medium text-foreground">Personal Brand OS</span>
          <ChevronRight className="size-3" />
        </p>
      </div>
    </footer>
  );
}
