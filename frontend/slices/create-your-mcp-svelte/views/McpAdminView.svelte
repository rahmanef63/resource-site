<script lang="ts">
  import {
    defaultSetupFields,
    type McpTokenRow,
    type SetupField,
  } from "../../create-your-mcp/views/mcp-admin-helpers";
  import McpSetupPanel from "./McpSetupPanel.svelte";
  import McpTokenTable from "./McpTokenTable.svelte";

  type Props = {
    rows: McpTokenRow[] | undefined;
    siteUrl: string;
    defaultClientId?: string;
    onRevoke: (id: string, label: string) => Promise<void> | void;
    setupFields?: SetupField[];
  };

  let {
    rows,
    siteUrl,
    defaultClientId = "my-app-mcp",
    onRevoke,
    setupFields,
  }: Props = $props();

  let fields = $derived(setupFields ?? defaultSetupFields(siteUrl, defaultClientId));
</script>

<div class="space-y-6">
  <header class="space-y-2">
    <div class="text-xs uppercase tracking-widest text-muted-foreground">Admin / Integrations</div>
    <h1 class="text-3xl font-bold">MCP &amp; OAuth Tokens</h1>
    <p class="max-w-2xl text-sm text-muted-foreground">
      Bearer tokens minted through OAuth for AI clients, or through the static
      <code class="text-xs">MCP_API_KEY</code> fallback for service accounts. Revoke any token to cut access on the next call.
    </p>
  </header>

  <McpSetupPanel {fields} />
  <McpTokenTable {rows} {onRevoke} />

  <section class="space-y-2 rounded-lg border-2 border-foreground/40 bg-card p-4 text-xs">
    <h3 class="text-sm font-bold uppercase tracking-widest">MCP_API_KEY (static fallback)</h3>
    <p class="text-muted-foreground">
      Static bearer for service accounts and CI scripts. It does not appear in the table above.
      Rotate it on both your host and Convex deployment.
    </p>
  </section>
</div>
