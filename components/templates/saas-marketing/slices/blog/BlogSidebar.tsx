"use client";

import * as React from "react";
import Link from "next/link";
import { Mail, Rss, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { usePosts } from "../../shared/store";
import { PUBLIC_BASE } from "../../shared/nav-config";

/** CK-2B — right-rail companion for the Blog list. Tag cloud derived from
 *  live posts + newsletter capture + RSS hint. Pure client (uses store). */
export function BlogSidebar() {
  const posts = usePosts();

  const tagCounts = React.useMemo(() => {
    const map = new Map<string, number>();
    posts.forEach((p) => p.tags.forEach((t) => map.set(t, (map.get(t) ?? 0) + 1)));
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [posts]);

  const authors = React.useMemo(() => {
    const map = new Map<string, number>();
    posts.forEach((p) => map.set(p.author, (map.get(p.author) ?? 0) + 1));
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [posts]);

  const [email, setEmail] = React.useState("");
  const [sent, setSent] = React.useState(false);

  return (
    <aside className="space-y-4">
      <Card className="border-border/60 bg-gradient-to-br from-violet-500/10 via-card/60 to-indigo-500/10">
        <CardContent className="p-5">
          <Mail className="size-4 text-muted-foreground" />
          <h3 className="mt-3 text-base font-semibold tracking-tight">
            Get every post in your inbox
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Weekly digest. One click to unsubscribe. No tracking pixel.
          </p>
          <form
            className="mt-4 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (email.includes("@")) setSent(true);
            }}
          >
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@team.com"
              className="h-9 text-xs"
            />
            <Button type="submit" size="sm" disabled={sent}>
              {sent ? "✓ Sent" : "Join"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/60">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Tag className="size-4" /> Tags
            </h3>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {tagCounts.length}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tagCounts.map(([t, n]) => (
              <Badge key={t} variant="outline" className="rounded-full text-[10px]">
                {t} <span className="ml-1 font-mono text-muted-foreground">{n}</span>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/60">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold">Authors</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {authors.map(([name, n]) => (
              <li key={name} className="flex items-center gap-3">
                <div className="grid size-7 place-items-center rounded-full bg-gradient-to-br from-violet-500/25 to-indigo-500/25 text-[10px] font-semibold">
                  {name
                    .split(" ")
                    .map((s) => s[0])
                    .join("")}
                </div>
                <span className="flex-1 truncate">{name}</span>
                <span className="font-mono text-[10px] text-muted-foreground">{n} post{n > 1 ? "s" : ""}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Button asChild variant="ghost" size="sm" className="w-full justify-start gap-2">
        <Link href={`${PUBLIC_BASE}/blog/rss.xml`}>
          <Rss className="size-3.5" /> Subscribe via RSS
        </Link>
      </Button>
    </aside>
  );
}
