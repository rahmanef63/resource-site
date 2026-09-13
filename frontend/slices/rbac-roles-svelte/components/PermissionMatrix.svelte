<script lang="ts">
  import { matchPermission } from "../../rbac-roles/lib/permissions";
  import {
    PERMISSION_GROUPS,
    type PermissionGroup,
  } from "../../rbac-roles/lib/permission-catalog";

  type Props = {
    value: readonly string[];
    onChange?: (next: string[]) => void;
    groups?: PermissionGroup[];
    readOnly?: boolean;
    class?: string;
  };

  let {
    value,
    onChange,
    groups = PERMISSION_GROUPS,
    readOnly = false,
    class: className = "",
  }: Props = $props();

  let isSuper = $derived(value.includes("*"));
  let locked = $derived(readOnly || isSuper || !onChange);

  function checked(key: string): boolean {
    return isSuper || value.some((permission) => matchPermission(permission, key));
  }

  function toggle(key: string, enabled: boolean): void {
    if (locked || !onChange) return;
    onChange(
      enabled
        ? [...new Set([...value, key])]
        : value.filter((permission) => permission !== key),
    );
  }
</script>

<div class={`space-y-4 ${className}`}>
  {#each groups as group (group.group)}
    <section class="space-y-2">
      <p class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {group.group}
      </p>
      <div class="grid gap-2 sm:grid-cols-2">
        {#each group.permissions as permission (permission.key)}
          {@const id = `perm-${permission.key}`}
          <label
            for={id}
            class={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-normal ${locked ? "cursor-default opacity-80" : "cursor-pointer hover:bg-accent/40"}`}
          >
            <input
              id={id}
              type="checkbox"
              checked={checked(permission.key)}
              disabled={locked}
              onchange={(event) => toggle(permission.key, event.currentTarget.checked)}
            />
            <span>{permission.label}</span>
            <code class="ml-auto text-[10px] text-muted-foreground">{permission.key}</code>
          </label>
        {/each}
      </div>
    </section>
  {/each}

  {#if isSuper}
    <p class="text-xs text-muted-foreground">
      Role holds <code>*</code> (superadmin) — every permission is granted.
    </p>
  {/if}
</div>
