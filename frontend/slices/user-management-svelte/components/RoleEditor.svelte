<script lang="ts">
  import RolePermissionGrid from "./RolePermissionGrid.svelte"; import type { ManagedRole, PermissionGroupDef, RolesLabels } from "../../user-management/types";
  let { role, permissionGroups, canManage, onSave, onDelete, labels }: { role: ManagedRole | null; permissionGroups: PermissionGroupDef[]; canManage: boolean; onSave?: (role: ManagedRole) => void | Promise<void>; onDelete?: (input: { slug: string }) => void | Promise<void>; labels: RolesLabels } = $props();
  let nameOverride = $state<string | undefined>(); let descriptionOverride = $state<string | undefined>(); let permsOverride = $state<string[] | undefined>(); let pending = $state(false);
  let name = $derived(nameOverride ?? role?.name ?? ""); let description = $derived(descriptionOverride ?? role?.description ?? ""); let perms = $derived(permsOverride ?? role?.permissions ?? []);
  let isNew = $derived(!role); let isSystem = $derived(!!role?.isSystem); let editable = $derived(canManage && !isSystem);
  const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  async function save() { if (!editable || !onSave || !name.trim()) return; pending = true; try { await onSave({ slug: role?.slug ?? slugify(name), name: name.trim(), description: description.trim() || undefined, permissions: perms, color: role?.color, level: role?.level, isSystem: false }); } finally { pending = false; } }
</script>

<div class="space-y-4">
  <label class="grid gap-1.5 text-sm">{labels.roleName}<input class="rounded-md border bg-background px-3 py-2" value={name} oninput={(e) => nameOverride = e.currentTarget.value} placeholder={labels.roleNamePlaceholder} disabled={!editable} /></label>
  <label class="grid gap-1.5 text-sm">{labels.roleDescription}<textarea class="rounded-md border bg-background px-3 py-2" rows="2" value={description} oninput={(e) => descriptionOverride = e.currentTarget.value} placeholder={labels.roleDescriptionPlaceholder} disabled={!editable}></textarea></label>
  <section class="space-y-2"><p class="text-sm font-medium">{labels.permissions}</p><RolePermissionGrid value={perms} groups={permissionGroups} onChange={editable ? (next) => permsOverride = next : undefined} readOnly={!editable} /></section>
  {#if isSystem}<p class="text-xs text-muted-foreground">{labels.systemRole}</p>{/if}
  {#if editable}<div class="flex gap-2"><button type="button" class="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground" onclick={save} disabled={pending || !name.trim()}>{pending ? labels.saving : labels.save}</button>{#if !isNew && onDelete}<button type="button" class="rounded-md px-3 py-2 text-sm text-destructive" onclick={() => role && onDelete?.({ slug: role.slug })}>{labels.delete}</button>{/if}</div>{/if}
</div>
