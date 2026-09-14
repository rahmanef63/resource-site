import { Send, ShieldCheck, UserMinus, Users } from "lucide-react";
import {
  FlowDiagram,
  PreviewSection,
  SlicePreviewLayout,
} from "@/components/slice-previews/preview-layout";
import { Card } from "@/components/ui/card";
import { SubscribeForm } from "@/features/resend-newsletter";

export default function Page() {
  return (
    <SlicePreviewLayout
      title="Resend — Newsletter"
      kind="full"
      description="Single-opt-in subscribe/unsubscribe + admin-gated subscriber list and campaign scheduling. The preview intentionally leaves the host adapter unconfigured, so it never mutates data or sends email."
      sourceUrl="https://github.com/rahmanef63/resource-site/tree/main/frontend/slices/resend-newsletter"
    >
      <PreviewSection title="Subscribe form — safe wiring state" hint="No network mutation in the public preview">
        <SubscribeForm />
      </PreviewSection>

      <PreviewSection title="Public subscription flow">
        <FlowDiagram
          steps={[
            { title: "Host configures adapter", detail: "Bind SubscribeForm to mutation.subscribe" },
            { title: "Submit email", detail: "Normalize + honeypot + per-email rate limit" },
            { title: "Activate immediately", detail: "newsletterSubscribers.status = active" },
            { title: "Unsubscribe anytime", detail: "mutation.unsubscribe is public + idempotent" },
          ]}
        />
      </PreviewSection>

      <PreviewSection title="Admin campaign boundary">
        <div className="grid gap-2 md:grid-cols-3">
          <Card className="p-4">
            <div className="flex items-center gap-2 font-medium"><Users className="size-4" /> Subscribers</div>
            <p className="mt-2 text-xs text-muted-foreground">Admin-only list from the real `newsletterSubscribers` table.</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 font-medium"><ShieldCheck className="size-4" /> Auth gate</div>
            <p className="mt-2 text-xs text-muted-foreground">Convex Auth + admin/super-admin check runs before campaign scheduling.</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 font-medium"><Send className="size-4" /> Delivery worker</div>
            <p className="mt-2 text-xs text-muted-foreground">Only the internal worker imports Resend and calls `emails.send`.</p>
          </Card>
        </div>
      </PreviewSection>

      <PreviewSection title="Actual Convex tables">
        <div className="grid gap-2 sm:grid-cols-3">
          {[
            ["newsletterSubscribers", "Active/unsubscribed addresses"],
            ["newsletterIssues", "Draft/sending/sent campaigns"],
            ["newsletterSubscribeAttempts", "Public subscribe rate-limit ledger"],
          ].map(([name, detail]) => (
            <Card key={name} className="p-4">
              <div className="flex items-center gap-2 font-mono text-xs"><UserMinus className="size-3.5" /> {name}</div>
              <p className="mt-2 text-xs text-muted-foreground">{detail}</p>
            </Card>
          ))}
        </div>
      </PreviewSection>
    </SlicePreviewLayout>
  );
}
