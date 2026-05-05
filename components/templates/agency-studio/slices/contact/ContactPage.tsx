"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { DEFAULT_SITE_CONFIG } from "../../shared/site-config";
import { nid, useStore } from "../../shared/store";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";

export function ContactPage() {
  const c = DEFAULT_SITE_CONFIG;
  const { dispatch } = useStore();
  const [submitting, setSubmitting] = React.useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    const company = String(fd.get("company") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    const topic = String(fd.get("topic") ?? "").trim();
    const budget = String(fd.get("budget") ?? "").trim();
    if (!name || !email.includes("@") || !topic) {
      toast.error("Please fill name, email, and topic.");
      setSubmitting(false);
      return;
    }
    dispatch({
      type: "lead.create",
      lead: { id: nid("lead"), name, company, email, topic, budget, source: "Contact form", status: "new", ts: Date.now() },
    });
    toast.success("Brief received — we'll respond within 24h.");
    (e.currentTarget as HTMLFormElement).reset();
    setSubmitting(false);
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <SectionHead eyebrow="Contact" title="Send a brief" subtitle={`Email us directly at ${c.email} or fill the form below.`} />
      <Card className="mt-10 border-border/60">
        <CardContent className="p-6">
          <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Your name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" name="company" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="topic">What can we help with?</Label>
              <Textarea id="topic" name="topic" rows={4} placeholder="Brand strategy, identity, design system…" required />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="budget">Budget range (optional)</Label>
              <Input id="budget" name="budget" placeholder="Rp 50–100jt" />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Sending…" : "Send brief"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
