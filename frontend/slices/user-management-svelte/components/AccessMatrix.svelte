<script lang="ts">
  import RoleChip from "./RoleChip.svelte"; import { can } from "../../user-management/lib/can";
  import { DEFAULT_ACCESS_LABELS, tenantKey, type AccessCells, type AccessMatrixLabels, type MatrixUser, type TenantNode } from "../../user-management/access-types";
  import type { RoleOption } from "../../user-management/types";
  let { tenants, users, cells, roles, currentPerms, onAssign, labels: overrides = {}, className = "" }: {
    tenants: TenantNode[]; users: MatrixUser[]; cells: AccessCells; roles: RoleOption[]; currentPerms?: readonly string[];
    onAssign?: (input: { userId: string; tenantId: string | null; roleSlug: string }) => void | Promise<void>;
    labels?: Partial<AccessMatrixLabels>; className?: string;
  } = $props();
  let labels = $derived({ ...DEFAULT_ACCESS_LABELS, ...overrides }); let editable = $derived(!!currentPerms && can(currentPerms, "members.manage") && !!onAssign);
  const userLabel = (user: MatrixUser) => user.name ?? user.email ?? "Unknown";
  const roleOf = (slug?: string) => slug ? (roles.find((role) => role.slug === slug) ?? { slug, name: slug }) : undefined;
</script>

{#if users.length === 0}<p class="p-6 text-center text-sm text-muted-foreground">{labels.empty}</p>{:else}
<div class={`overflow-x-auto rounded-lg border ${className}`}><table class="w-full text-sm"><thead class="border-b"><tr><th class="sticky left-0 bg-background px-3 py-2 text-left">{labels.member}</th>{#each tenants as tenant (tenantKey(tenant.id))}<th class="whitespace-nowrap px-3 py-2 text-left">{tenant.name}</th>{/each}</tr></thead><tbody class="divide-y">
{#each users as user (user.userId)}<tr><td class="sticky left-0 bg-background px-3 py-2"><div class="flex items-center gap-2"><span class="grid h-6 w-6 place-items-center rounded-full bg-muted text-[9px]">{userLabel(user).slice(0, 2).toUpperCase()}</span><span class="truncate">{userLabel(user)}</span></div></td>
{#each tenants as tenant (tenantKey(tenant.id))}{@const slug = cells[user.userId]?.[tenantKey(tenant.id)]}{@const role = roleOf(slug)}<td class="px-3 py-2">{#if editable}<select class="rounded-md border bg-background px-2 py-1 text-xs" value={slug ?? ""} onchange={(event) => { if (event.currentTarget.value) onAssign?.({ userId: user.userId, tenantId: tenant.id, roleSlug: event.currentTarget.value }); }}><option value="">{labels.noAccess}</option>{#each roles as option (option.slug)}<option value={option.slug}>{option.name}</option>{/each}</select>{:else if role}<RoleChip {role} />{:else}<span class="text-xs text-muted-foreground">{labels.noAccess}</span>{/if}</td>{/each}</tr>{/each}
</tbody></table></div>{/if}
