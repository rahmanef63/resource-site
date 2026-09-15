<script lang="ts">
  import { matchPermission } from "../../user-management/lib/can"; import type { PermissionGroupDef } from "../../user-management/types";
  let { value, groups, onChange, readOnly = false, className = "" }: { value: readonly string[]; groups: PermissionGroupDef[]; onChange?: (next: string[]) => void; readOnly?: boolean; className?: string } = $props();
  let isSuper = $derived(value.includes("*")); let locked = $derived(readOnly || isSuper || !onChange);
  const checked = (key: string) => isSuper || value.some((permission) => matchPermission(permission, key));
  function toggle(key: string, enabled: boolean) { if (locked) return; onChange?.(enabled ? [...new Set([...value, key])] : value.filter((permission) => permission !== key)); }
</script>

<div class={`space-y-4 ${className}`}>
  {#each groups as group (group.group)}<section class="space-y-2"><p class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{group.group}</p><div class="grid gap-2 sm:grid-cols-2">
    {#each group.permissions as permission (permission.key)}<label class="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"><input type="checkbox" checked={checked(permission.key)} disabled={locked} onchange={(e) => toggle(permission.key, e.currentTarget.checked)} /><span>{permission.label}</span><code class="ml-auto text-[10px] text-muted-foreground">{permission.key}</code></label>{/each}
  </div></section>{/each}
  {#if isSuper}<p class="text-xs text-muted-foreground">Role holds <code>*</code> — every permission granted.</p>{/if}
</div>
