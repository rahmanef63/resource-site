"use client";

/** Interactive theme-token widgets (form + tabs + people) for the theme-presets
 *  preview board. Stateful so the controls feel live; every surface is built
 *  from shadcn primitives so switching preset re-skins them instantly. */

import * as React from "react";
import { Bell, Check } from "lucide-react";
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function FormCard() {
  const [on, setOn] = React.useState(true);
  const [agree, setAgree] = React.useState(true);
  const [vol, setVol] = React.useState([60]);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Form controls</CardTitle>
        <CardDescription>input · switch · checkbox · slider</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="tp-email">Email</Label>
          <Input id="tp-email" placeholder="you@example.com" defaultValue="hello@rahmanef.com" />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="tp-notif">Email notifications</Label>
          <Switch id="tp-notif" checked={on} onCheckedChange={setOn} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={agree} onCheckedChange={(c) => setAgree(!!c)} />
          Accept terms &amp; conditions
        </label>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <Label>Volume</Label>
            <span className="tabular-nums text-muted-foreground">{vol[0]}%</span>
          </div>
          <Slider value={vol} onValueChange={setVol} max={100} step={1} />
        </div>
      </CardContent>
    </Card>
  );
}

export function TabsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tabs &amp; alert</CardTitle>
        <CardDescription>secondary + muted surfaces</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="overview">
          <TabsList className="w-full">
            <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
            <TabsTrigger value="activity" className="flex-1">Activity</TabsTrigger>
            <TabsTrigger value="settings" className="flex-1">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="pt-3 text-sm text-muted-foreground">
            Tokens drive every layer — background, card, border, muted, ring.
          </TabsContent>
          <TabsContent value="activity" className="pt-3 text-sm text-muted-foreground">
            Switch a preset and watch this panel re-skin live.
          </TabsContent>
          <TabsContent value="settings" className="pt-3 text-sm text-muted-foreground">
            No globals.css edits — the registry ships inside the slice.
          </TabsContent>
        </Tabs>
        <Alert>
          <Bell className="h-4 w-4" />
          <AlertTitle>Heads up</AlertTitle>
          <AlertDescription>This alert uses card + border + foreground tokens.</AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

const PEOPLE = [
  { name: "Ada Lovelace", role: "Owner", initials: "AL" },
  { name: "Alan Turing", role: "Admin", initials: "AT" },
  { name: "Grace Hopper", role: "Editor", initials: "GH" },
];

export function PeopleCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team</CardTitle>
        <CardDescription>avatar · badge · list rows</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        {PEOPLE.map((p) => (
          <div key={p.name} className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-accent hover:text-accent-foreground">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{p.initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{p.name}</p>
              <p className="truncate text-xs text-muted-foreground">{p.role}</p>
            </div>
            {p.role === "Owner" ? (
              <Badge><Check className="mr-1 h-3 w-3" />You</Badge>
            ) : (
              <Badge variant="secondary">{p.role}</Badge>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
