import { describe, expect, it } from "vitest";
import {
  DOKU_CHANNELS,
  formatIDR,
  groupDokuChannels,
  groupVa,
} from "./doku-core";
import { dokuPaymentTools, midtransPaymentTools } from "./tools";

describe("payment portable core", () => {
  it("groups only allowed DOKU channels without mutating the catalog", () => {
    const groups = groupDokuChannels(["QRIS", "VIRTUAL_ACCOUNT_BCA"]);
    expect(groups.qris.map((item) => item.id)).toEqual(["QRIS"]);
    expect(groups.va.map((item) => item.id)).toEqual(["VIRTUAL_ACCOUNT_BCA"]);
    expect(Object.values(groups).flat()).toHaveLength(2);
    expect(DOKU_CHANNELS.length).toBeGreaterThan(2);
  });

  it("keeps Indonesian payment formatting deterministic", () => {
    expect(formatIDR(150_000)).toMatch(/150[.\s]?000/);
    expect(groupVa("1234567890")).toBe("1234 5678 90");
  });

  it("keeps create/refund dangerous for both provider tool surfaces", () => {
    for (const collection of [dokuPaymentTools, midtransPaymentTools]) {
      expect(collection.tools.find((tool) => tool.name === "create_invoice")?.dangerous).toBe(true);
      expect(collection.tools.find((tool) => tool.name === "refund")?.dangerous).toBe(true);
      expect(collection.tools.find((tool) => tool.name === "status")?.dangerous).not.toBe(true);
    }
  });
});
