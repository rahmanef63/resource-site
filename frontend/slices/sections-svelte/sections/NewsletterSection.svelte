<script lang="ts">
  import { cfgString, parseConfigObject } from "../../sections/sections/config";
  import type { LandingSection } from "../../sections/types";
  type Result = { ok: boolean; notice?: string };
  type Props = { section: LandingSection; placeholder?: string; buttonLabel?: string; successText?: string; onSubscribe?: (email: string) => Promise<Result>; class?: string };
  let { section, placeholder = "Alamat email kamu", buttonLabel = "Daftar", successText = "Terima kasih — kamu terdaftar!", onSubscribe, class: className = "" }: Props = $props();
  let cfg = $derived(parseConfigObject(section.config));
  let ph = $derived(cfgString(cfg, "placeholder") ?? placeholder);
  let btn = $derived(cfgString(cfg, "buttonLabel") ?? buttonLabel);
  let success = $derived(cfgString(cfg, "successText") ?? successText);
  let email = $state(""); let done = $state(false); let busy = $state(false); let notice = $state("");
  async function submit(event: SubmitEvent) { event.preventDefault(); if (!email.includes("@")) return; notice = ""; if (!onSubscribe) { done = true; return; } busy = true; try { const result = await onSubscribe(email); if (result.ok) done = true; else notice = result.notice ?? "Gagal mendaftar — coba lagi."; } catch { notice = "Gagal mendaftar — coba lagi."; } finally { busy = false; } }
</script>
<div class={`mx-auto max-w-3xl px-4 py-16 sm:px-6 ${className}`.trim()}><div class="rounded-2xl border border-border/60 bg-gradient-to-b from-muted/40 to-card/60 p-8 text-center sm:p-10"><span aria-hidden="true" class="text-2xl">✉</span><h2 class="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">{section.title}</h2>{#if section.subtitle}<p class="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{section.subtitle}</p>{/if}{#if done}<p class="mt-6 text-sm font-medium">✓ {success}</p>{:else}<form class="mx-auto mt-6 flex max-w-md flex-col gap-2 sm:flex-row" onsubmit={submit}><input type="email" required aria-label="Email address" bind:value={email} placeholder={ph} class="h-10 flex-1 rounded-md border bg-background px-3 text-sm" /><button type="submit" disabled={busy} class="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50">{btn}</button></form>{/if}{#if notice}<p class="mt-3 text-sm text-muted-foreground">{notice}</p>{/if}</div></div>
