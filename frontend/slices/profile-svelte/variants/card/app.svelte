<script lang="ts">
  import { initials, readAboutProfile } from "@/features/profile/lib/core";
  import FaqList from "./components/FaqList.svelte";

  const profile = readAboutProfile();
</script>

<div class="h-full overflow-y-auto bg-background text-foreground">
  <article class="flex flex-col items-center px-6 py-8 text-center">
    <div class="grid size-20 place-items-center overflow-hidden rounded-3xl bg-primary text-2xl font-semibold text-primary-foreground shadow-lg">
      {#if profile.avatarUrl}
        <img src={profile.avatarUrl} alt={profile.name} class="size-full object-cover" />
      {:else}
        {initials(profile.name)}
      {/if}
    </div>

    <h1 class="mt-5 text-2xl font-semibold tracking-tight">{profile.name}</h1>
    <p class="mt-1 text-xs font-medium text-muted-foreground">{profile.roles.join(" · ")}</p>
    {#if profile.location}
      <p class="mt-1 text-[11px] text-muted-foreground">⌖ {profile.location}</p>
    {/if}

    <p class="mt-4 max-w-sm text-xs leading-relaxed text-muted-foreground">{profile.description}</p>

    {#if profile.links.length > 0}
      <div class="mt-6 flex w-full max-w-sm flex-col gap-2 text-left">
        {#each profile.links as link (link.href)}
          <a
            href={link.href}
            target="_blank"
            rel="noreferrer noopener"
            class="flex items-center gap-3 rounded-lg border border-border bg-card/60 px-3 py-2 text-sm transition-colors hover:bg-foreground/5"
          >
            <span aria-hidden="true">{link.href.startsWith("mailto:") ? "@" : "↗"}</span>
            <span class="truncate">{link.label}</span>
            <span class="ml-auto text-muted-foreground" aria-hidden="true">↗</span>
          </a>
        {/each}
      </div>
    {/if}

    {#if profile.faq.length > 0}
      <div class="mt-6 w-full max-w-sm text-left">
        <h2 class="mb-2 text-sm font-semibold">FAQ</h2>
        <FaqList items={profile.faq} />
      </div>
    {/if}
  </article>
</div>
