"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "ok" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    // Wire to Convex action: api.newsletter.actions.subscribe({ email })
    setTimeout(() => setStatus("ok"), 600);
  }

  return (
    <Card className="mx-auto mt-12 flex max-w-md flex-col gap-3 p-6">
      <h2 className="text-xl font-semibold">Subscribe to the newsletter</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@domain.com"
        />
        <Button type="submit" disabled={status === "submitting"}>
          {status === "submitting" ? "Subscribing…" : "Subscribe"}
        </Button>
        {status === "ok" && <p className="text-sm text-green-600">Check your inbox to confirm.</p>}
      </form>
    </Card>
  );
}
