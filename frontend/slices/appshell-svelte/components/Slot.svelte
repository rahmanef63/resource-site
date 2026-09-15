<script lang="ts">
 import{getContext}from"svelte";import{APPSHELL_CONTEXT,type AppShellContext}from"../lib/context";import type{SlotRegion}from"../types";let{region,slotProps={}}:{region:SlotRegion;slotProps?:Record<string,unknown>}=$props();const ctx=getContext<AppShellContext>(APPSHELL_CONTEXT);let Comp=$derived(ctx.manifest.slots?.[region]);
</script>
{#if Comp}<Comp {...slotProps}/>{/if}
