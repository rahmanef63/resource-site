"use client";

import * as React from "react";
import { Mail, Send, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Name</label>
            <input className="mt-1.5 h-9 w-full rounded-md border border-border/60 bg-background px-3 text-sm outline-none focus:border-primary" placeholder="Jane Doe" />
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Email</label>
            <input type="email" className="mt-1.5 h-9 w-full rounded-md border border-border/60 bg-background px-3 text-sm outline-none focus:border-primary" placeholder="jane@example.com" />
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Topic</label>
            <select className="mt-1.5 h-9 w-full rounded-md border border-border/60 bg-background px-3 text-sm outline-none focus:border-primary">
              <option>General inquiry</option><option>Bug report</option><option>Feature request</option><option>Other</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Message</label>
            <textarea className="mt-1.5 min-h-[100px] w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm outline-none focus:border-primary" placeholder="What's on your mind?" />
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
