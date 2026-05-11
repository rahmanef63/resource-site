"use client";

import * as React from "react";
import { Mail, MousePointerClick, ShieldCheck, Server } from "lucide-react";
import { SlicePreviewLayout, PreviewSection, CodeBlock, FlowDiagram } from "@/components/slice-previews/preview-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Page() {
  const [email, setEmail] = React.useState("");
  const [sent, setSent] = React.useState(false);

  return (
    <SlicePreviewLayout
      title="Convex Auth — Email Magic Link"
      kind="backend"
      description="@convex-dev/auth + Resend magic-link provider. Self-hosted Convex friendly. No Clerk."
      sourceUrl="https://github.com/rahmanef63/resource-site/tree/main/frontend/slices/convex-auth"
    >
      <PreviewSection title="Sign-in surface" hint="Sample UI consumers compose">
        <Card className="mx-auto max-w-sm p-6">
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
      </PreviewSection>

      <PreviewSection title="Auth flow">
        <FlowDiagram
          steps={[
            { title: "User submits email", detail: "<SignInForm> → signIn('resend', {email})" },
            { title: "Resend sends link", detail: "AUTH_RESEND_KEY → user inbox" },
            { title: "User clicks link", detail: "GET /api/auth/callback?token=…" },
            { title: "Session minted", detail: "JWT signed with JWT_PRIVATE_KEY → cookie set" },
          ]}
        />
      </PreviewSection>

      <PreviewSection title="What's stored">
        <div className="grid gap-2 sm:grid-cols-3 text-xs">
          <Tile icon={Mail} label="users" desc="email, image, name, metadata" />
          <Tile icon={ShieldCheck} label="authSessions" desc="session cookie ↔ userId" />
          <Tile icon={Server} label="JWKS" desc="public keys for verification" />
        </div>
      </PreviewSection>

      <PreviewSection title="Env">
        <div className="grid gap-1.5 text-xs">
          {[
            ["AUTH_RESEND_KEY", "Resend API key for sending magic links"],
            ["JWT_PRIVATE_KEY", "Server-side JWT signing key"],
            ["JWKS", "Public-key JSON Web Key Set"],
            ["SITE_URL", "Used in magic-link href"],
          ].map(([k, v]) => (
            <div key={k} className="flex items-baseline gap-3 rounded-md border px-3 py-1.5">
              <code className="font-mono text-[11px]">{k}</code>
              <Badge variant="outline" className="text-[9px]">convex</Badge>
              <span className="text-[11px] text-muted-foreground">{v}</span>
            </div>
          ))}
        </div>
      </PreviewSection>

      <PreviewSection title="Wiring">
        <CodeBlock>{`// convex/auth.ts
import { convexAuth } from "@convex-dev/auth/server";
import Resend from "@convex-dev/auth/providers/Resend";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Resend({ from: "auth@yourdomain.com" })],
});

// app/proxy.ts (Next 16 — NOT middleware.ts)
import { convexAuthNextjsMiddleware } from "@convex-dev/auth/nextjs/server";
export default convexAuthNextjsMiddleware();`}</CodeBlock>
      </PreviewSection>
    </SlicePreviewLayout>
  );
}

function Tile({
  icon: Icon,
  label,
  desc,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  desc: string;
}) {
  return (
    <Card className="p-3">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <code className="text-xs">{label}</code>
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">{desc}</p>
    </Card>
  );
}
