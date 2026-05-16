import * as React from "react";
import { Check, ChevronRight, Sparkles } from "lucide-react";
import { IconBrandGithub } from "@tabler/icons-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export function ComponentShowcase() {
  return (
    <section className="border-y py-16">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Composed from shadcn primitives.
          </h2>
          <p className="mt-2 text-muted-foreground">
            Every layout and recipe ships with these — Form, Tabs, Sidebar, Command, Toast,
            Sheet, Dropdown — assembled the way you'd actually use them.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {/* Login Form */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Sign in</CardTitle>
              <CardDescription className="text-xs">
                Form + Input + Label + Button
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="ex-email" className="text-xs">Email</Label>
                <Input id="ex-email" placeholder="you@studio.com" className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ex-pw" className="text-xs">Password</Label>
                <Input id="ex-pw" type="password" placeholder="••••••••" className="h-9" />
              </div>
              <Button className="w-full" size="sm">Continue</Button>
              <Button variant="outline" className="w-full gap-2" size="sm">
                <IconBrandGithub className="size-3.5" /> GitHub
              </Button>
            </CardContent>
          </Card>

          {/* Pricing Tier */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                Pro
                <Badge variant="secondary" className="rounded-full text-[10px]">popular</Badge>
              </CardTitle>
              <CardDescription className="text-xs">
                Card + Badge + checkmarks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold">$29</span>
                <span className="text-xs text-muted-foreground">/mo</span>
              </div>
              <Separator />
              <ul className="space-y-1.5 text-xs">
                {["Unlimited projects", "Advanced auditing", "Priority support"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-muted-foreground">
                    <Check className="size-3.5 text-foreground" /> {f}
                  </li>
                ))}
              </ul>
              <Button className="w-full" size="sm">Start trial</Button>
            </CardContent>
          </Card>

          {/* AI Chat */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Install with Agent</CardTitle>
              <CardDescription className="text-xs">
                Dialog + Code Block + Copy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-md border bg-muted/30 p-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
                <span className="text-foreground"># Bootstrap from Rahman Resources</span>
                <br />
                Use <span className="text-foreground">Rahman Resources</span> to scaffold…
                <br />
                Layout: <span className="text-foreground">landing-marketing</span>
              </div>
              <Button className="w-full gap-1.5" size="sm">
                <Sparkles className="size-3.5" /> Copy prompt
              </Button>
              <p className="text-[10px] text-muted-foreground">
                Reads <code className="font-mono">/llms.txt</code> + <code className="font-mono">/api/knowledge</code>
              </p>
            </CardContent>
          </Card>

          {/* Status / Dashboard */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Workspace</CardTitle>
              <CardDescription className="text-xs">
                Avatar + Badge + List item
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Audit-bp gate", state: "green" as const, value: "82" },
                { label: "Convex codegen", state: "green" as const, value: "ok" },
                { label: "RBAC checks", state: "amber" as const, value: "2 warns" },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        row.state === "green"
                          ? "size-1.5 rounded-full bg-emerald-500"
                          : "size-1.5 rounded-full bg-amber-500"
                      }
                    />
                    <span className="text-xs text-foreground">{row.label}</span>
                  </div>
                  <span className="font-mono text-[11px] text-muted-foreground">{row.value}</span>
                </div>
              ))}
              <Separator />
              <Button variant="ghost" size="sm" className="-ml-2 h-7 gap-1 text-xs">
                Open dashboard <ChevronRight className="size-3" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
