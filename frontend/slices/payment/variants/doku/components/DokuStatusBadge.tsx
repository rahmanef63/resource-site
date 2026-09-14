"use client";

/**
 * Live status badge — props-driven so the slice stays Convex-free at the
 * type-checking level. Consumer feeds `status` from a Convex reactive
 * query, and optionally `onResync` from an action.
 *
 *   const order = useQuery(api.features.payment.query.getOrderByOrderId, { orderId });
 *   const sync = useAction(api.features.payment.actions.doku.getPaymentStatus);
 *   <DokuStatusBadge
 *     status={order?.status ?? "pending"}
 *     onResync={() => sync({ orderId })}
 *   />
 */

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DOKU_STATUS_LABEL } from "@/features/payment/lib/doku-core";
import type { DokuStatus } from "@/features/payment/lib/contracts";
export type { DokuStatus } from "@/features/payment/lib/contracts";

const VARIANT: Record<DokuStatus, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  client_claimed: "secondary",
  paid: "default",
  failed: "destructive",
  expired: "outline",
  refunded: "outline",
};

interface Props {
  status: DokuStatus;
  onResync?: () => void | Promise<unknown>;
}

export function DokuStatusBadge({ status, onResync }: Props) {
  return (
    <div className="flex items-center gap-2">
      <Badge variant={VARIANT[status]}>{DOKU_STATUS_LABEL[status]}</Badge>
      {status === "pending" && onResync && (
        <Button size="sm" variant="ghost" onClick={() => void onResync()}>
          Cek ulang
        </Button>
      )}
    </div>
  );
}
