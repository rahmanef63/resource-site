<script lang="ts">
  import type { Snippet } from "svelte";
  import type {
    AdminAccess,
    AdminAccessLevel,
  } from "@/features/admin/variants/console/lib/sections";
  import {
    hasPermission,
    meetsLevel,
  } from "@/features/admin/variants/console/lib/access";

  type Props = {
    access: AdminAccess;
    minLevel?: AdminAccessLevel;
    permission?: string;
    children: Snippet;
    fallback?: Snippet;
  };

  let {
    access,
    minLevel = "delegated_admin",
    permission,
    children,
    fallback,
  }: Props = $props();

  let allowed = $derived(
    permission
      ? access.level === "platform_admin" || hasPermission(access.permissions, permission)
      : meetsLevel(access.level, minLevel),
  );
</script>

{#if !access.isLoading}
  {#if allowed}
    {@render children()}
  {:else if fallback}
    {@render fallback()}
  {/if}
{/if}
