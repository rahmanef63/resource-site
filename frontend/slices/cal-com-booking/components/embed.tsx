"use client";

// Cal.com embed stub — wraps @calcom/embed-react.

import { Card } from "@/components/ui/card";

export default function CalEmbed() {
  const username = process.env.NEXT_PUBLIC_CALCOM_USERNAME ?? "your-handle";
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 p-8">
      <Card className="p-4 text-sm text-muted-foreground">
        Embed will render here for <code>cal.com/{username}</code>. Wire <code>@calcom/embed-react</code>&apos;s{" "}
        <code>&lt;Cal /&gt;</code> component.
      </Card>
    </main>
  );
}
