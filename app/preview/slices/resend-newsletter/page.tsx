"use client";

import * as React from "react";
import { Mail, Users, Send } from "lucide-react";
import { SlicePreviewLayout, PreviewSection, CodeBlock, FlowDiagram } from "@/components/slice-previews/preview-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Page() {
  return (
    <SlicePreviewLayout
      title="Resend — Transactional & Newsletter"
      kind="backend"
      description="Transactional + broadcast email via Resend. Double opt-in. Magic-link delivery."
      sourceUrl="https://github.com/rahmanef63/resource-site/tree/main/frontend/slices/resend-newsletter"
    >
      <PreviewSection title="Subscribe form" hint="Sample double opt-in">
        <Card className="mx-auto max-w-md p-5">
          <h2 className="text-lg font-semibold">Newsletter</h2>
          <p className="text-xs text-muted-foreground">Update mingguan langsung di inbox.</p>
          <form className="mt-3 flex gap-2">
            <Input type="email" placeholder="kamu@example.com" />
            <Button type="submit">Subscribe</Button>
          </form>
          <p className="mt-2 text-[10px] text-muted-foreground">
            Kami kirim link konfirmasi dulu — klik untuk aktifkan.
          </p>
        </Card>
      </PreviewSection>

      <PreviewSection title="Sample email">
        <div className="mx-auto max-w-xl overflow-hidden rounded-lg border">
          <div className="border-b bg-muted/30 px-4 py-2 text-xs">
            <div><span className="text-muted-foreground">From:</span> Rahman &lt;hello@rahmanef.com&gt;</div>
            <div><span className="text-muted-foreground">Subject:</span> Konfirmasi langganan</div>
          </div>
          <div className="space-y-3 bg-background px-5 py-6 text-sm">
            <h3 className="text-base font-semibold">Konfirmasi email kamu</h3>
            <p className="text-muted-foreground">
              Klik tombol di bawah untuk aktifkan langganan ke newsletter Rahmanef.
            </p>
            <Button>Konfirmasi</Button>
            <p className="text-[10px] text-muted-foreground">
              Kalau bukan kamu yang subscribe, abaikan email ini.
            </p>
          </div>
        </div>
      </PreviewSection>

      <PreviewSection title="Flow — double opt-in">
        <FlowDiagram
          steps={[
            { title: "Submit email", detail: "subscriber.create(status=pending)" },
            { title: "Confirmation send", detail: "Resend → user inbox" },
            { title: "User clicks link", detail: "/api/newsletter/confirm?token=…" },
            { title: "Activated", detail: "status=confirmed → Resend Audiences" },
          ]}
        />
      </PreviewSection>

      <PreviewSection title="Two use modes" hint="Same Resend client, two purposes">
        <div className="grid gap-2 sm:grid-cols-2">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              <span className="font-medium">Transactional</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Magic links, order receipts, password resets. Direct call from Convex action.
            </p>
            <Badge variant="outline" className="mt-2 font-mono text-[10px]">resend.emails.send()</Badge>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="font-medium">Broadcast</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Newsletter blast ke audience tertarget. Schedule + segmentation lewat Resend dashboard.
            </p>
            <Badge variant="outline" className="mt-2 font-mono text-[10px]">resend.broadcasts.send()</Badge>
          </Card>
        </div>
      </PreviewSection>

      <PreviewSection title="Wiring">
        <CodeBlock>{`// convex/features/newsletter/subscribe.ts
import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import { Resend } from "resend";

export const subscribe = mutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const token = crypto.randomUUID();
    await ctx.db.insert("subscribers", { email, status: "pending", token, createdAt: Date.now() });
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.RESEND_FROM!, to: email,
      subject: "Konfirmasi langganan",
      html: \`<a href="\${process.env.SITE_URL}/newsletter/confirm?token=\${token}">Konfirmasi</a>\`,
    });
  },
});`}</CodeBlock>
      </PreviewSection>
    </SlicePreviewLayout>
  );
}
