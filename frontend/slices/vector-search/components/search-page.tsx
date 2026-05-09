"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function SearchPage() {
  const [q, setQ] = useState("");
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-4 p-8">
      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" />
      <Card className="p-4 text-sm text-muted-foreground">
        Stub — wire to <code>useAction(api.search.actions.semantic)</code> with the embedding provider of your choice.
      </Card>
    </main>
  );
}
