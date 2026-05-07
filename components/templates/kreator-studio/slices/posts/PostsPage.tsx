"use client";

import * as React from "react";
import { Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { fmtDate, useNewsletters } from "../../shared/store";

export function PostsPage() {
  const issues = useNewsletters();
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <SectionHead
        eyebrow="Archive"
        title="Semua issue newsletter"
        subtitle="Browse semua tulisan yang sudah pernah dikirim."
      />
      <div className="grid gap-3">
        {issues.map((n) => (
          <Card key={n.id} className="border-border/60 bg-card/60">
            <CardContent className="flex items-start gap-4 p-5">
              <Mail className="mt-1 size-4 text-muted-foreground" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="rounded-full text-[10px] capitalize">{n.status}</Badge>
                  <span className="text-[11px] text-muted-foreground">{fmtDate(n.scheduledAt)}</span>
                </div>
                <h3 className="mt-1 text-base font-medium">{n.subject}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{n.preview}</p>
                {n.status === "sent" && (
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    {n.recipients.toLocaleString()} recipients · {n.openRate.toFixed(1)}% open rate
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
