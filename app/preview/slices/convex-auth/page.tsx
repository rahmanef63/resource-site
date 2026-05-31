"use client";

import * as React from "react";
import { Mail } from "lucide-react";
import { SlicePreviewLayout } from "@/components/slice-previews/preview-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function Page() {
  const [email, setEmail] = React.useState("");
  const [sent, setSent] = React.useState(false);

  return (
    <SlicePreviewLayout
      title="Convex Auth — Multi-Provider Sign-in"
      kind="backend"
      description="@convex-dev/auth + Resend magic-link provider. Self-hosted Convex friendly. No Clerk."
      sourceUrl="https://github.com/rahmanef63/resource-site/tree/main/frontend/slices/convex-auth"
    >
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-sm p-6">
          {!sent ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
              className="space-y-3"
            >
              <h2 className="text-lg font-semibold">Masuk</h2>
              <p className="text-xs text-muted-foreground">Link masuk akan dikirim ke email.</p>
              <Input
                type="email"
                placeholder="kamu@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" className="w-full">Kirim magic link</Button>
            </form>
          ) : (
            <div className="space-y-3 text-center">
              <Mail className="mx-auto h-8 w-8 text-emerald-500" />
              <h2 className="text-lg font-semibold">Cek inbox</h2>
              <p className="text-xs text-muted-foreground">
                Link dikirim ke <span className="font-mono">{email || "you@example.com"}</span>.
              </p>
              <Button variant="ghost" size="sm" onClick={() => setSent(false)}>Ulangi</Button>
            </div>
          )}
        </Card>
      </div>
    </SlicePreviewLayout>
  );
}
