<script lang="ts">
  type EmptyStateKind = "404" | "500" | "403" | "no-results" | "empty-list" | "first-use";
  type EmptyStateAction = { label: string; href?: string; onClick?: () => void };

  type Props = {
    kind?: EmptyStateKind;
    title?: string;
    description?: string;
    primaryAction?: EmptyStateAction;
    secondaryAction?: EmptyStateAction;
    compact?: boolean;
    class?: string;
  };

  const PRESETS: Record<EmptyStateKind, { title: string; description: string }> = {
    "404": { title: "Page not found", description: "The page you are looking for does not exist." },
    "500": { title: "Something went wrong", description: "Please try again in a moment." },
    "403": { title: "Access denied", description: "You do not have permission to view this resource." },
    "no-results": { title: "No results", description: "Try changing your search or filters." },
    "empty-list": { title: "Nothing here yet", description: "Create your first item to get started." },
    "first-use": { title: "Get started", description: "Set up your first item to continue." },
  };

  let {
    kind,
    title,
    description,
    primaryAction,
    secondaryAction,
    compact = false,
    class: className = "",
  }: Props = $props();

  let preset = $derived(kind ? PRESETS[kind] : undefined);
  let resolvedTitle = $derived(title ?? preset?.title ?? "Nothing here");
  let resolvedDescription = $derived(description ?? preset?.description);
</script>

<section data-kind={kind} class={`flex flex-col items-center gap-4 rounded-lg border p-8 text-center ${compact ? "gap-3 p-4 md:p-6" : ""} ${className}`}>
  <div class="flex size-10 items-center justify-center rounded-full bg-muted text-lg text-muted-foreground" aria-hidden="true">!</div>
  <div class="space-y-1.5">
    <h2 class="text-lg font-semibold">{resolvedTitle}</h2>
    {#if resolvedDescription}
      <p class="max-w-md text-sm leading-relaxed text-muted-foreground">{resolvedDescription}</p>
    {/if}
  </div>
  {#if primaryAction || secondaryAction}
    <div class="flex flex-wrap items-center justify-center gap-2">
      {#if primaryAction}
        {#if primaryAction.href}
          <a class="inline-flex h-8 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground" href={primaryAction.href} onclick={primaryAction.onClick}>{primaryAction.label}</a>
        {:else}
          <button class="inline-flex h-8 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground" type="button" onclick={primaryAction.onClick}>{primaryAction.label}</button>
        {/if}
      {/if}
      {#if secondaryAction}
        {#if secondaryAction.href}
          <a class="inline-flex h-8 items-center rounded-md border px-3 text-sm font-medium" href={secondaryAction.href} onclick={secondaryAction.onClick}>{secondaryAction.label}</a>
        {:else}
          <button class="inline-flex h-8 items-center rounded-md border px-3 text-sm font-medium" type="button" onclick={secondaryAction.onClick}>{secondaryAction.label}</button>
        {/if}
      {/if}
    </div>
  {/if}
</section>
