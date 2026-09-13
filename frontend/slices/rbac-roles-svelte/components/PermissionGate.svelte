<script lang="ts">
  import type { Snippet } from "svelte";
  import { hasPermission } from "../../rbac-roles/lib/check";
  import type { Permission } from "../../rbac-roles/lib/permissions";

  type Props = {
    permissions: readonly Permission[];
    require: string | string[];
    mode?: "all" | "any";
    children: Snippet;
    fallback?: Snippet;
  };

  let { permissions, require, mode = "all", children, fallback }: Props = $props();
  let wanted = $derived(Array.isArray(require) ? require : [require]);
  let allowed = $derived(
    mode === "any"
      ? wanted.some((permission) => hasPermission(permissions, permission))
      : wanted.every((permission) => hasPermission(permissions, permission)),
  );
</script>

{#if allowed}
  {@render children()}
{:else if fallback}
  {@render fallback()}
{/if}
