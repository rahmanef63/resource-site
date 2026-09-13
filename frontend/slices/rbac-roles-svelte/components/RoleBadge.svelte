<script lang="ts">
  import { ROLE_MAP, type RoleSlug } from "../../rbac-roles/lib/roles";

  type Props = {
    role: RoleSlug | { name: string; color?: string };
    class?: string;
  };

  let { role, class: className = "" }: Props = $props();
  let preset = $derived(typeof role === "string" ? ROLE_MAP.get(role) : undefined);
  let name = $derived(typeof role === "string" ? preset?.name ?? role : role.name);
  let color = $derived(typeof role === "string" ? preset?.color : role.color);
</script>

<span class={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-normal ${className}`}>
  {#if color}
    <span class="h-2 w-2 shrink-0 rounded-full" style={`background-color:${color}`}></span>
  {/if}
  {name}
</span>
