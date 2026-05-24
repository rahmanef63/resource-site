"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, Save, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { nid, useStore } from "../../../shared/store";
import { ADMIN_BASE } from "../../../shared/nav-config";
import type { NewsletterDraft } from "../../../shared/types";

export function NewsletterComposeView({ id }: { id?: string }) {
  const router = useRouter();
  const { state, dispatch } = useStore();

  const existing = id ? state.newsletters.find((n) => n.id === id) ?? null : null;
  const draftFallback = existing ?? state.newsletters.find((n) => n.status === "draft") ?? null;

  const [subject, setSubject] = React.useState(draftFallback?.subject ?? "");
  const [preheader, setPreheader] = React.useState(draftFallback?.preheader ?? "");
  const [body, setBody] = React.useState(
    draftFallback?.body ??
      "Halo,\n\nTulis intro di sini — sapa subscriber dengan voice studio.\n\n— Asti R., Studio principal",
  );
  const [preview, setPreview] = React.useState(false);

  const confirmed = state.subscribers.filter((s) => s.status === "confirmed").length;

  const save = (status: NewsletterDraft["status"]) => {
    if (!subject.trim()) {
      toast.error("Subject wajib diisi");
      return;
    }
    const draft: NewsletterDraft = {
      id: existing?.id ?? draftFallback?.id ?? nid("nl"),
      subject,
      preheader,
      body,
      status,
      sentAt: status === "sent" ? Date.now() : existing?.sentAt ?? 0,
      recipients: status === "sent" ? confirmed : existing?.recipients ?? 0,
      ts: Date.now(),
    };
    dispatch({ type: "newsletter.upsert", draft });
    if (status === "sent") {
      dispatch({ type: "newsletter.send", id: draft.id });
      toast.success(`Newsletter dikirim ke ${confirmed} subscriber`);
      router.push(`${ADMIN_BASE}/newsletter`);
    } else {
      toast.success(status === "scheduled" ? "Newsletter dijadwalkan" : "Draft tersimpan");
    }
  };

  const previewBody = body
    .split(/\n\n+/)
    .map((para, i) => <p key={i} className="leading-relaxed">{para}</p>);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button asChild size="sm" variant="ghost" className="gap-1">
          <Link href={`${ADMIN_BASE}/newsletter`}>
            <ArrowLeft className="size-3.5" /> Newsletter
          </Link>
        </Button>
        <span className="text-sm text-muted-foreground">/</span>
        <span className="text-sm">{existing ? "Edit draft" : "Compose"}</span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setPreview((p) => !p)} className="gap-1.5">
            <Eye className="size-3.5" /> {preview ? "Edit" : "Preview"}
          </Button>
          <Button size="sm" variant="outline" onClick={() => save("draft")} className="gap-1.5">
            <Save className="size-3.5" /> Save draft
          </Button>
          <Button size="sm" onClick={() => save("sent")} className="gap-1.5">
            <Send className="size-3.5" /> Send to {confirmed}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card className="border-border/60 bg-card/60">
          <CardContent className="space-y-4 p-6">
            {preview ? (
              <article className="prose prose-invert max-w-none space-y-3 text-sm">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{preheader}</p>
                <h2 className="text-xl font-semibold tracking-tight">{subject}</h2>
                <div className="space-y-3 text-foreground/90">{previewBody}</div>
              </article>
            ) : (
              <>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Subject line — keep ≤ 60 chars"
                  className="h-12 border-none bg-transparent text-xl font-semibold tracking-tight focus-visible:ring-0"
                />
                <Input
                  value={preheader}
                  onChange={(e) => setPreheader(e.target.value)}
                  placeholder="Preheader — secondary line shown in inbox"
                  className="text-sm"
                />
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={18}
                  className="font-mono text-sm leading-relaxed"
                  placeholder="Body — paragraph dipisah baris kosong."
                />
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60">
          <CardContent className="space-y-3 p-5 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Audience</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight">{confirmed}</p>
              <p className="text-[11px] text-muted-foreground">confirmed subscribers</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Estimated send</p>
              <Badge variant="outline" className="rounded-full">~{Math.ceil(confirmed / 5)} sec</Badge>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Scheduling</p>
              <Button size="sm" variant="outline" onClick={() => save("scheduled")} className="h-7 gap-1.5">
                Schedule for tomorrow 09:00
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Demo data — real impl wire ke `convex/features/newsletter/send.ts` + Resend / Postmark adapter.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
