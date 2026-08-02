"use client";

import * as React from "react";
import { Mail, Send, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export default function Page() {
  const [state, setState] = React.useState<"idle" | "sending" | "sent">("idle");
  const send = async () => {
    setState("sending");
    setTimeout(() => setState("sent"), 1200);
  };
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto grid min-h-screen max-w-5xl grid-cols-1 items-center gap-12 px-6 py-12 lg:grid-cols-2">
        <div>
          <div className="grid size-10 place-items-center rounded-lg bg-primary/10"><Mail className="size-5 text-primary" /></div>
          <h1 className="mt-5 text-3xl font-bold tracking-tight">Get in touch</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Drop a note and we&apos;ll reply within a business day. Posts to Resend, lands in our shared inbox.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            <li className="flex items-center gap-2"><Check className="size-4 text-emerald-500" /> Honeypot + rate-limit protected</li>
            <li className="flex items-center gap-2"><Check className="size-4 text-emerald-500" /> Zod-validated server action</li>
            <li className="flex items-center gap-2"><Check className="size-4 text-emerald-500" /> Replies tracked to Convex thread</li>
          </ul>
        </div>
        <form className="space-y-4 rounded-2xl border border-border/60 bg-card p-6" onSubmit={(e) => { e.preventDefault(); send(); }}>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Name</Label>
            <Input placeholder="Jane Doe" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Email</Label>
            <Input type="email" placeholder="jane@example.com" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Topic</Label>
            <Select defaultValue="general">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General inquiry</SelectItem>
                <SelectItem value="bug">Bug report</SelectItem>
                <SelectItem value="feature">Feature request</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Message</Label>
            <Textarea className="min-h-[100px]" placeholder="What's on your mind?" />
          </div>
          <Button
            type="submit"
            disabled={state !== "idle"}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md text-sm font-medium disabled:opacity-60"
          >
            {state === "idle" && (<><Send className="size-4" /> Send message</>)}
            {state === "sending" && (<><Loader2 className="size-4 animate-spin" /> Sending…</>)}
            {state === "sent" && (<><Check className="size-4" /> Sent — we&apos;ll be in touch</>)}
          </Button>
        </form>
      </section>
    </main>
  );
}
