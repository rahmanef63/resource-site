<script lang="ts">
  import RoleChip from "./RoleChip.svelte"; import RoleEditor from "./RoleEditor.svelte"; import { can } from "../../user-management/lib/can";
  import { DEFAULT_ROLES_LABELS, type ManagedRole, type PermissionGroupDef, type RolesLabels } from "../../user-management/types";
  let { roles, currentPerms, permissionGroups, onUpsert, onRemove, labels: overrides = {}, className = "" }: {
    roles: ManagedRole[]; currentPerms: readonly string[]; permissionGroups: PermissionGroupDef[];
    onUpsert?: (role: ManagedRole) => void | Promise<void>; onRemove?: (input: { slug: string }) => void | Promise<void>;
    labels?: Partial<RolesLabels>; className?: string;
  } = $props();
  let selectedOverride = $state<string | null | undefined>(); let creating = $state(false);
  let labels = $derived({ ...DEFAULT_ROLES_LABELS, ...overrides }); let canManage = $derived(can(currentPerms, "roles.manage"));
  let selected = $derived(selectedOverride === undefined ? (roles[0]?.slug ?? null) : selectedOverride);
  let current = $derived(creating ? null : roles.find((role) => role.slug === selected) ?? null);
  let editorKey = $derived(creating ? "__new__" : current?.slug ?? "__empty__");
  async function save(role: ManagedRole) { await onUpsert?.(role); creating = false; selectedOverride = role.slug; }
  async function remove(input: { slug: string }) { await onRemove?.(input); creating = false; selectedOverride = roles.find((role) => role.slug !== input.slug)?.slug ?? null; }
</script>

<div class={`grid gap-6 lg:grid-cols-[260px_1fr] ${className}`}>
  <aside class="space-y-2">
    <div class="flex items-center justify-between"><p class="text-sm font-medium">{labels.title}</p>{#if canManage && onUpsert}<button type="button" class="rounded-md border px-2 py-1 text-xs" onclick={() => { creating = true; selectedOverride = null; }}>{labels.newRole}</button>{/if}</div>
    <ul class="space-y-1">{#each roles as role (role.slug)}<li><button type="button" class={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm ${!creating && selected === role.slug ? "bg-accent" : "hover:bg-muted"}`} onclick={() => { creating = false; selectedOverride = role.slug; }}><RoleChip {role} /><span class="ml-auto text-xs text-muted-foreground">{role.permissions.includes("*") ? "all" : role.permissions.length}</span></button></li>{/each}</ul>
  </aside>
  <section class="rounded-lg border p-4">
    {#if creating || current}{#key editorKey}<RoleEditor role={current} {permissionGroups} {canManage} onSave={save} onDelete={remove} {labels} />{/key}{:else}<p class="text-sm text-muted-foreground">{labels.emptyEditor}</p>{/if}
  </section>
</div>
