"use client";

/** Theme-token widget board for the theme-presets preview — a dashboard of
 *  shadcn blocks (buttons, badges, stats, progress, charts, form, tabs, team)
 *  so every theme token (primary / secondary / accent / muted / destructive /
 *  border / ring) is visible at a glance and re-skins the instant a preset is
 *  picked. */

import { TrendingUp, ArrowUpRight } from "lucide-react";
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FormCard, TabsCard, PeopleCard } from "./theme-widgets-b";

function ControlsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Buttons &amp; badges</CardTitle>
        <CardDescription>every variant, one preset</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button size="sm">Primary</Button>
          <Button size="sm" variant="secondary">Secondary</Button>
          <Button size="sm" variant="outline">Outline</Button>
          <Button size="sm" variant="ghost">Ghost</Button>
          <Button size="sm" variant="destructive">Delete</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

const BARS = [42, 68, 55, 81, 47, 73, 60];

function StatsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Revenue
          <Badge variant="secondary" className="gap-1 font-normal">
            <ArrowUpRight className="h-3 w-3" /> +12.5%
          </Badge>
        </CardTitle>
        <CardDescription>primary · accent bars + progress</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-3xl font-semibold tabular-nums">$48,210</p>
        <div className="flex h-20 items-end gap-1.5">
          {BARS.map((h, i) => (
            <div
              key={i}
              className={i === 3 ? "flex-1 rounded-sm bg-primary" : "flex-1 rounded-sm bg-accent"}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Quarterly goal</span><span>73%</span>
          </div>
          <Progress value={73} />
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        <TrendingUp className="mr-1 h-3 w-3" /> Trending up this month
      </CardFooter>
    </Card>
  );
}

export function ThemeWidgets() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <ControlsCard />
      <StatsCard />
      <FormCard />
      <TabsCard />
      <PeopleCard />
      <Card className="flex flex-col items-start justify-center gap-3 bg-primary text-primary-foreground">
        <CardContent className="space-y-2 pt-6">
          <p className="text-sm font-semibold uppercase tracking-wider opacity-80">Primary surface</p>
          <p className="text-2xl font-semibold leading-tight">Ship a brand in one click.</p>
          <p className="text-sm opacity-80">This whole panel is the --primary token.</p>
          <Button variant="secondary" size="sm" className="mt-2">Get started</Button>
        </CardContent>
      </Card>
    </div>
  );
}
