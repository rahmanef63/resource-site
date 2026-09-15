<script lang="ts">
  import type { RoleOption } from "../../user-management/types";
  let { role, className = "" }: { role: RoleOption; className?: string } = $props();
</script>

<span class={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs ${className}`}>
  {#if role.color}<span class="h-2 w-2 shrink-0 rounded-full" style={`background-color:${role.color}`}></span>{/if}
  {role.name}
</span>
