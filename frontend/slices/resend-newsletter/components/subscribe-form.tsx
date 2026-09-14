"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { newsletterSuccessMessage } from "../lib/core";
import { newsletterPublicApi } from "../lib/host";

export default function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (busy || !newsletterPublicApi.configured) return;
    setBusy(true);
    setMessage("");
    setError("");
    try {
      const result = await newsletterPublicApi.subscribe({ email, website });
      setMessage(newsletterSuccessMessage(result));
      if (!result.already) setEmail("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not subscribe. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="mx-auto mt-12 flex max-w-md flex-col gap-3 p-6">
      <div>
        <h2 className="text-xl font-semibold">Subscribe to the newsletter</h2>
        <p className="mt-1 text-sm text-muted-foreground">Single opt-in: a successful submit activates the address immediately.</p>
      </div>
      {!newsletterPublicApi.configured && (
        <p className="rounded-md border border-border bg-muted/40 p-3 text-sm text-muted-foreground" role="status">
          Configure the newsletter adapter before rendering this form.
        </p>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Label htmlFor="newsletter-email">Email</Label>
        <Input
          id="newsletter-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@domain.com"
        />
        <label className="sr-only" aria-hidden="true">
          Website
          <input tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} />
        </label>
        <Button type="submit" disabled={busy || !newsletterPublicApi.configured}>
          {busy ? "Subscribing…" : "Subscribe"}
        </Button>
        {message && <p className="text-sm text-emerald-600" role="status">{message}</p>}
        {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
      </form>
    </Card>
  );
}
