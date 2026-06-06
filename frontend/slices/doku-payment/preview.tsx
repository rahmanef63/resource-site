"use client";
/** Variant preview (VP wave) — rr-internal, stripped on `rr add`. */
import type { SlicePreviewModule } from "@/shared/preview/types";
import {
  DokuPaymentInstructions,
  type PaymentInstructions,
} from "./components/DokuPaymentInstructions";

type Demo = { channel: string; instructions: PaymentInstructions; expiresAt?: number };

const SCENARIOS: Record<string, Demo> = {
  "virtual-account": {
    channel: "VIRTUAL_ACCOUNT_BCA",
    instructions: { vaNumber: "8277081234567890", howToPayUrl: "#" },
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  },
  qris: {
    channel: "QRIS",
    instructions: { qrString: "00020101021126610014ID.DEMO.WWW0118SANDBOX-NO-CHARGE-0000" },
  },
  ewallet: {
    channel: "EMONEY_GOPAY",
    instructions: { deeplink: "#", webUrl: "#" },
  },
  retail: {
    channel: "PEER_TO_PEER_KREDIVO",
    instructions: { paymentUrl: "#" },
  },
};

const preview: SlicePreviewModule = {
  DokuPaymentInstructions: ({ variant }) => {
    const scenario = variant.scenario ?? "virtual-account";
    const demo = SCENARIOS[scenario] ?? SCENARIOS["virtual-account"];
    return (
      <div className="p-4">
        <p className="mb-3 text-xs text-muted-foreground">
          Sandbox — no real charge. Links are placeholders.
        </p>
        <DokuPaymentInstructions
          channel={demo.channel}
          instructions={demo.instructions}
          expiresAt={demo.expiresAt}
        />
      </div>
    );
  },
};
export default preview;
