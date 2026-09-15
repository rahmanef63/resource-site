<script lang="ts">
  import { onMount } from "svelte";
  import { badgeStore, type AppIconBadge } from "../../appshell/lib/badges-core";
  import type { AppDescriptor } from "../types";
  let { app, label = true, onclick }: { app: AppDescriptor; label?: boolean; onclick?: (e:MouseEvent)=>void } = $props();
  let badge=$state<AppIconBadge|undefined>();
  onMount(()=>{badge=badgeStore.getOne(app.id);return badgeStore.subscribe(()=>badge=badgeStore.getOne(app.id))});
</script>
<button type="button" class="app" {onclick} title={app.title} aria-label={app.title}>
  <span class="tile" style={`background:${app.gradient??"linear-gradient(145deg,#64748b,#0f172a)"}`}>{app.icon??app.title.slice(0,1).toUpperCase()}{#if badge?.count}<b>{badge.count>99?"99+":badge.count}</b>{:else if badge?.dot}<i></i>{/if}</span>
  {#if label}<span class="label">{app.title}</span>{/if}
</button>
<style>.app{display:grid;gap:.3rem;justify-items:center;border:0;background:transparent;color:inherit;min-width:0;cursor:pointer}.tile{position:relative;display:grid;width:48px;height:48px;place-items:center;border-radius:14px;color:white;font-weight:700;box-shadow:0 8px 18px #0003}.label{max-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:.72rem;text-shadow:0 1px 3px #0009}.tile b,.tile i{position:absolute;right:-5px;top:-5px;background:#ef4444;color:white;border:2px solid white;border-radius:999px;font:700 10px/1 system-ui;padding:3px 5px}.tile i{width:9px;height:9px;padding:0}</style>
