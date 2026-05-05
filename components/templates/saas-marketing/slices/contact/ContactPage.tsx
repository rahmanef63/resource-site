"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { DEFAULT_SITE_CONFIG } from "../../shared/site-config";

export function ContactPage() {
  const c = DEFAULT_SITE_CONFIG;
  const [submitted, setSubmitted] = React.useState(false);

  return (
    <section>
      <div className="mx-auto grid max-w-5xl gap-12 px-6 py-20 md:grid-cols-[1fr_1fr]">
        <div>
          <SectionHead
            eyebrow="Contact"
            title="Talk to a human"
            subtitle={`We answer every message — usually within a working day. Or email ${c.email} directly.`}
          />
          <div className="mt-8 space-y-3 text-sm text-muted-foreground">
            <p><span className="font-medium text-foreground">Sales:</span> custom pricing, security review, MSA.</p>
            <p><span className="font-medium text-foreground">Support:</span> bugs, integration help, onboarding.</p>
            <p><span className="font-medium text-foreground">Press / partnerships:</span> reach the founders directly.</p>
          </div>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
          className="space-y-4 rounded-lg border border-border/60 bg-card p-6"
        >
          {submitted ? (
            <div className="py-12 text-center">
              <p className="text-base font-medium">Got it — thanks!</p>
              <p className="mt-1 text-sm text-muted-foreground">We'll reply to you within one working day.</p>
            </div>
          ) : (
            <>
              <div className="grid gap-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" required placeholder="Jane Developer" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="email">Work email</Label>
                <Input id="email" type="email" required placeholder="jane@startup.example" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="topic">What's this about?</Label>
                <Input id="topic" required placeholder="Volume pricing, security review, integration help…" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="msg">Message</Label>
                <Textarea id="msg" rows={5} placeholder="A few sentences is plenty." />
              </div>
              <Button type="submit" className="w-full">Send</Button>
            </>
          )}
        </form>
      </div>
    </section>
  );
}
