"use client";

import * as React from "react";
import { Plus, Webhook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SAMPLE_PAYLOAD, SAMPLE_SIGNATURE, SEED_DELIVERIES, SEED_ENDPOINTS } from "./seed";
import { EndpointRow } from "./endpoint-row";
import { DeliveryTable } from "./delivery-table";
import { BlockHeader } from "../../ui/block-header";
import { EmptyState } from "../../ui/empty-state";
import type { WebhookEndpoint } from "./types";

/** Real admin-panel "Webhooks" block — fifth BS-pattern impl.
 *  Pure client demo: endpoint list (active/paused/failing) with
 *  per-row pause/resume/test/rotate-secret/delete, recent deliveries
 *  table with HTTP code + retry count + replay, and a payload preview
 *  showing HMAC-SHA256 signature header that real impl would emit.
 *  No persistence. */
export function WebhooksBlockView() {
  const [endpoints, setEndpoints] = React.useState<WebhookEndpoint[]>(SEED_ENDPOINTS);
  const activeCount = endpoints.filter((e) => e.status === "active").length;
  const failingCount = endpoints.filter((e) => e.status === "failing").length;
  const last24h = SEED_DELIVERIES.length;
  const successRate = (
    (SEED_DELIVERIES.filter((d) => d.status === "delivered").length / SEED_DELIVERIES.length) *
    100
  ).toFixed(0);

  function togglePause(id: string) {
    setEndpoints((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, status: e.status === "paused" ? "active" : "paused" }
          : e,
      ),
    );
  }
  function remove(id: string) {
    setEndpoints((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <div className="space-y-6 p-6">
      <BlockHeader
        title="Webhooks"
        meta={`${endpoints.length} endpoint${endpoints.length === 1 ? "" : "s"} · ${activeCount} active · ${failingCount} failing · ${last24h} deliveries (24h) · ${successRate}% success`}
        actions={
          <Button size="sm" className="gap-1.5">
            <Plus className="size-3.5" />
            Add endpoint
          </Button>
        }
      />

      <Tabs defaultValue="endpoints">
        <TabsList>
          <TabsTrigger value="endpoints" className="text-xs">
            Endpoints
          </TabsTrigger>
          <TabsTrigger value="deliveries" className="text-xs">
            Recent deliveries
          </TabsTrigger>
          <TabsTrigger value="payload" className="text-xs">
            Payload format
          </TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints" className="mt-4">
          {endpoints.length === 0 ? (
            <EmptyState icon={Webhook} label="No endpoints configured" hint="Add one to start delivering events." />
          ) : (
            <div className="divide-y rounded-lg border bg-card">
              {endpoints.map((e) => (
                <EndpointRow
                  key={e.id}
                  endpoint={e}
                  onToggle={() => togglePause(e.id)}
                  onDelete={() => remove(e.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="deliveries" className="mt-4">
          <DeliveryTable />
        </TabsContent>

        <TabsContent value="payload" className="mt-4 space-y-3">
          <div>
            <p className="text-[10px] uppercase text-muted-foreground">Sample event body</p>
            <pre className="mt-1 overflow-x-auto rounded-lg border bg-muted/60 p-3 font-mono text-[10px] leading-relaxed">
              {SAMPLE_PAYLOAD}
            </pre>
          </div>
          <div>
            <p className="text-[10px] uppercase text-muted-foreground">HMAC-SHA256 signature header</p>
            <pre className="mt-1 overflow-x-auto rounded-lg border bg-muted/60 p-3 font-mono text-[10px] leading-relaxed">
              {SAMPLE_SIGNATURE}
            </pre>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Verify with: <code className="font-mono">HMAC-SHA256(secret, `${"${t}"}.${"${body}"}`)</code> ==
            the v1 token. Reject if older than 5 minutes (replay protection).
          </p>
        </TabsContent>
      </Tabs>

      <p className="text-[10px] text-muted-foreground">
        Demo data — resets on browser reload. Real impl would write deliveries to a Convex table
        + a scheduled function for retry-with-exponential-backoff.
      </p>
    </div>
  );
}
