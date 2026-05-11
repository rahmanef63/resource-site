"use client";

import * as React from "react";
import { Radio, Plus, Minus, RefreshCw, MonitorPlay } from "lucide-react";
import { SlicePreviewLayout, PreviewSection, CodeBlock } from "@/components/slice-previews/preview-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/**
 * Real BroadcastChannel demo. Open this page in 2 tabs of the same
 * origin → the counter syncs both directions.
 */

const CHANNEL = "rr:bc-demo";

export default function Page() {
  const [count, setCount] = React.useState(0);
  const [peers, setPeers] = React.useState(0);
  const chRef = React.useRef<BroadcastChannel | null>(null);

  React.useEffect(() => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) return;
    const ch = new BroadcastChannel(CHANNEL);
    chRef.current = ch;

    ch.onmessage = (e) => {
      const msg = e.data as { type: string; value?: number };
      if (msg.type === "set") setCount(msg.value ?? 0);
      if (msg.type === "ping") ch.postMessage({ type: "pong" });
      if (msg.type === "pong") setPeers((p) => p + 1);
    };

    // Announce + count peers in next tick
    ch.postMessage({ type: "ping" });
    setPeers(0);
    const t = setTimeout(() => setPeers((p) => p), 200);

    return () => {
      clearTimeout(t);
      ch.close();
    };
  }, []);

  function broadcast(value: number) {
    setCount(value);
    chRef.current?.postMessage({ type: "set", value });
  }

  return (
    <SlicePreviewLayout
      title="BroadcastChannel — Cross-tab Sync"
      kind="ui"
      description="Same-origin cross-tab/cross-iframe state sync. Web Platform API. Zero install."
      sourceUrl="https://github.com/rahmanef63/resource-site/tree/main/frontend/slices/broadcast-channel-sync"
    >
      <PreviewSection
        title="Live demo"
        hint={<span className="text-xs">Buka page ini di tab kedua — counter sync</span>}
      >
        <Card className="mx-auto max-w-md p-6 text-center">
          <Badge variant="outline" className="mx-auto text-[10px]">
            channel: <code className="ml-1 font-mono">{CHANNEL}</code>
          </Badge>
          <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Radio className="h-3 w-3" /> {peers} peer{peers === 1 ? "" : "s"} aktif
          </div>
          <div className="mt-6 font-mono text-6xl font-bold tabular-nums">{count}</div>
          <div className="mt-6 flex justify-center gap-2">
            <Button variant="outline" size="icon" onClick={() => broadcast(count - 1)}>
              <Minus className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => broadcast(0)}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => broadcast(count + 1)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </PreviewSection>

      <PreviewSection title="Two tabs, one state" hint="Open this page in a second tab">
        <div className="grid gap-3 sm:grid-cols-2">
          <DemoFrame label="Tab A — clicked +" count={count} />
          <DemoFrame label="Tab B — auto-synced" count={count} />
        </div>
      </PreviewSection>

      <PreviewSection title="When to use">
        <div className="space-y-2 text-sm">
          <p>
            <strong>Good for:</strong> demo / preview embedded in iframe yang perlu mirror state ke parent.
            Cross-tab sync ringan tanpa backend.
          </p>
          <p>
            <strong>Avoid for:</strong> data produksi. Pakai Convex realtime — BroadcastChannel cuma
            same-origin dan tidak survive reload.
          </p>
        </div>
      </PreviewSection>

      <PreviewSection title="Wiring">
        <CodeBlock>{`import { useBroadcastSync } from "@/features/broadcast-channel-sync";

const [count, setCount] = useBroadcastSync("rr:counter", 0);
<button onClick={() => setCount(count + 1)}>{count}</button>
// Any tab on the same origin sees the change instantly.`}</CodeBlock>
      </PreviewSection>
    </SlicePreviewLayout>
  );
}

function DemoFrame({ label, count }: { label: string; count: number }) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between border-b bg-muted/30 px-3 py-1.5">
        <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <MonitorPlay className="h-3 w-3" /> {label}
        </span>
      </div>
      <div className="flex h-32 items-center justify-center font-mono text-4xl font-bold tabular-nums">
        {count}
      </div>
    </Card>
  );
}
