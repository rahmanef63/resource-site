import { describe, expect, it } from "vitest";
import { createMockLoopSource } from "./mock-source";
import { createLoopPaginationController } from "./pagination";
import type { LoopEntitySource } from "./types";

describe("content-loops pagination controller", () => {
  it("uses limit for a single page and preserves total/hasMore", async () => {
    const controller = createLoopPaginationController({
      source: createMockLoopSource({ count: 5 }),
      limit: 2,
      orderBy: "order",
      direction: "desc",
    });

    await controller.refresh();
    const state = controller.getSnapshot();
    expect(state.items.map((item) => item.id)).toEqual(["5", "4"]);
    expect(state.totalItems).toBe(5);
    expect(state.hasMore).toBe(true);
    expect(state.loading).toBe(false);
    controller.dispose();
  });

  it("accumulates infinite pages without duplicating prior items", async () => {
    const controller = createLoopPaginationController({
      source: createMockLoopSource({ count: 5 }),
      pagination: "infinite",
      pageSize: 2,
    });

    await controller.refresh();
    expect(controller.getSnapshot().items).toHaveLength(2);
    await controller.loadMore();
    expect(controller.getSnapshot().items).toHaveLength(4);
    await controller.loadMore();
    expect(controller.getSnapshot().items).toHaveLength(5);
    expect(controller.getSnapshot().hasMore).toBe(false);
    controller.dispose();
  });

  it("surfaces source failures as Error state", async () => {
    const source: LoopEntitySource = {
      id: "test.fail",
      label: "Failure",
      fields: [],
      async fetch() {
        throw new Error("source unavailable");
      },
    };
    const controller = createLoopPaginationController({ source });
    await controller.refresh();
    expect(controller.getSnapshot().error?.message).toBe("source unavailable");
    expect(controller.getSnapshot().loading).toBe(false);
    controller.dispose();
  });
});
