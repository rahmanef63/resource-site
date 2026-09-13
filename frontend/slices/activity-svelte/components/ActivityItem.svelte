<script lang="ts">
  import { fmtDate, fmtTime } from "../../activity/lib/format";
  import type { ActivityCopy, ActivityRow, CategoryLabelMap } from "../../activity/lib/types";

  type Props = {
    row: ActivityRow;
    copy: ActivityCopy;
    categoryLabels: CategoryLabelMap;
    locale?: string;
    isLast?: boolean;
  };

  let { row, copy, categoryLabels, locale = "en-US", isLast = false }: Props = $props();
  let hasTagsOrLinks = $derived(Boolean(row.tags?.length || row.links?.length));
</script>

<li class:border-b-2={!isLast} class="group/row p-6 transition-colors hover:bg-foreground hover:text-background lg:p-7">
  <div class="mb-2 flex flex-wrap items-center gap-3 text-[10px] font-medium uppercase tracking-wider opacity-70">
    <span class="rounded-sm border-2 border-current px-2 py-0.5">
      {categoryLabels[row.category] ?? row.category}
    </span>
    <time datetime={new Date(row.occurredAt).toISOString()}>
      {fmtDate(row.occurredAt, locale)} · {fmtTime(row.occurredAt, locale)}
    </time>
    {#if row.project}<span>· {row.project}</span>{/if}
    {#if typeof row.durationMin === "number" && row.durationMin > 0}
      <span class="inline-flex items-center gap-1">
        <svg class="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
        {row.durationMin}m
      </span>
    {/if}
    <span class="ml-auto opacity-60">{copy.viaPrefix} {row.source}</span>
  </div>

  <h3 class="mb-2 font-serif text-xl leading-tight lg:text-2xl">{row.title}</h3>
  {#if row.summary}<p class="text-sm leading-relaxed opacity-85">{row.summary}</p>{/if}

  {#if hasTagsOrLinks}
    <div class="mt-3 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-wider">
      {#each row.tags ?? [] as tag (tag)}
        <span class="inline-flex items-center gap-1 rounded-sm border-2 border-current px-2 py-0.5">
          <svg class="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M20 13 11 22l-9-9V4a2 2 0 0 1 2-2h9l7 7a3 3 0 0 1 0 4Z" />
            <circle cx="8.5" cy="8.5" r="1.5" />
          </svg>
          {tag}
        </span>
      {/each}
      {#each row.links ?? [] as link (link.url)}
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1 rounded-sm border-2 border-current px-2 py-0.5 hover:bg-current hover:text-background"
        >
          {link.label}
          <svg class="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M7 17 17 7M7 7h10v10" />
          </svg>
        </a>
      {/each}
    </div>
  {/if}
</li>
