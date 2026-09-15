<script lang="ts">
  import AccessMatrix from "./AccessMatrix.svelte"; import MembersPanel from "./MembersPanel.svelte"; import RolesPanel from "./RolesPanel.svelte"; import TeamsPanel from "./TeamsPanel.svelte";
  import type { ComponentProps } from "svelte";
  type Tab = "members" | "roles" | "teams" | "access";
  let { members, roles, teams, access, defaultTab = "members", membersLabel = "Members", rolesLabel = "Roles", teamsLabel = "Teams", accessLabel = "Access", className = "" }: {
    members: ComponentProps<typeof MembersPanel>; roles: ComponentProps<typeof RolesPanel>; teams?: ComponentProps<typeof TeamsPanel>; access?: ComponentProps<typeof AccessMatrix>;
    defaultTab?: Tab; membersLabel?: string; rolesLabel?: string; teamsLabel?: string; accessLabel?: string; className?: string;
  } = $props();
  let activeOverride = $state<Tab | undefined>(); let active = $derived(activeOverride ?? defaultTab);
  const select = (tab: Tab) => activeOverride = tab;
</script>

<section class={className}>
  <nav class="flex flex-wrap gap-1 rounded-lg bg-muted p-1" aria-label="User management sections">
    <button type="button" class={`rounded-md px-3 py-1.5 text-sm ${active === "members" ? "bg-background shadow-sm" : ""}`} onclick={() => select("members")}>{membersLabel}</button>
    <button type="button" class={`rounded-md px-3 py-1.5 text-sm ${active === "roles" ? "bg-background shadow-sm" : ""}`} onclick={() => select("roles")}>{rolesLabel}</button>
    {#if teams}<button type="button" class={`rounded-md px-3 py-1.5 text-sm ${active === "teams" ? "bg-background shadow-sm" : ""}`} onclick={() => select("teams")}>{teamsLabel}</button>{/if}
    {#if access}<button type="button" class={`rounded-md px-3 py-1.5 text-sm ${active === "access" ? "bg-background shadow-sm" : ""}`} onclick={() => select("access")}>{accessLabel}</button>{/if}
  </nav>
  <div class="mt-4">{#if active === "members"}<MembersPanel {...members} />{:else if active === "roles"}<RolesPanel {...roles} />{:else if active === "teams" && teams}<TeamsPanel {...teams} />{:else if active === "access" && access}<AccessMatrix {...access} />{/if}</div>
</section>
