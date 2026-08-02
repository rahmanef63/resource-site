// Agentic tool collection. Ctx wraps ONE useBroadcastSync instance the host
// owns (host serializes its T to/from string), so an agent can read the
// shared value and publish updates to every tab.

import { defineToolCollection, noArgs, obj, str } from "@/shared/agentic";

export type BroadcastChannelSyncCtx = {
  channel: string;
  /** Current value, serialized by the host. */
  get: () => string;
  /** Publish a new value (host parses the string back into its T). */
  set: (value: string) => void;
};

export const broadcastChannelSyncTools = defineToolCollection<BroadcastChannelSyncCtx>({
  namespace: "broadcast-channel-sync",
  instructions: "Cross-tab state channel. read the current value before publish; publish notifies every open tab, so avoid noisy loops.",
  describe: (ctx) => `channel "${ctx.channel}" = ${ctx.get()}`,
  tools: [
    {
      name: "read",
      description: "Read the channel's current synced value.",
      parameters: noArgs,
      run: (ctx) => ctx.get(),
    },
    {
      name: "publish",
      description: "Publish a new value to the channel (syncs across tabs/iframes).",
      parameters: obj({ "value!": str("new value (host-defined format)") }),
      run: (ctx, a) => {
        ctx.set(a.value as string);
        return `published to "${ctx.channel}"`;
      },
    },
  ],
});
