<script lang="ts">
  import { readResumeProfile } from "@/features/profile/lib/core";

  const profile = readResumeProfile();

  function contactMark(href: string): string {
    if (href.startsWith("mailto:")) return "@";
    if (/^https?:/.test(href)) return "↗";
    return "•";
  }

  function printResume() {
    if (typeof window !== "undefined") window.print();
  }
</script>

<div class="h-full overflow-y-auto bg-card text-foreground">
  <article class="mx-auto max-w-2xl px-7 py-8 print:px-0 print:py-0">
    <header class="flex items-start justify-between gap-4 border-b border-border pb-5">
      <div class="min-w-0">
        <h1 class="text-2xl font-semibold tracking-tight">{profile.name}</h1>
        <p class="mt-1 text-sm font-medium text-muted-foreground">{profile.roles.join(" · ")}</p>
        {#if profile.location}
          <p class="mt-1 text-xs text-muted-foreground">⌖ {profile.location}</p>
        {/if}
        <div class="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
          {#each profile.contacts as contact (contact.href)}
            <a
              href={contact.href}
              target="_blank"
              rel="noreferrer noopener"
              class="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary"
            >
              <span aria-hidden="true">{contactMark(contact.href)}</span>
              <span class="truncate">{contact.label}</span>
            </a>
          {/each}
        </div>
      </div>
      <button type="button" class="shrink-0 rounded-md border px-3 py-1.5 text-xs font-medium print:hidden" onclick={printResume}>
        Print / PDF
      </button>
    </header>

    <section class="mt-6">
      <h2 class="text-sm font-semibold tracking-tight">Summary</h2>
      <p class="mt-2.5 text-sm leading-relaxed text-muted-foreground">{profile.summary}</p>
    </section>

    <section class="mt-6">
      <h2 class="text-sm font-semibold tracking-tight">Skills</h2>
      <div class="mt-2.5 flex flex-wrap gap-1.5">
        {#each profile.skills as skill (skill)}
          <span class="rounded-full border border-border bg-foreground/5 px-2.5 py-1 text-xs">{skill}</span>
        {/each}
      </div>
    </section>

    <section class="mt-6">
      <h2 class="text-sm font-semibold tracking-tight">Experience</h2>
      <div class="mt-2.5 flex flex-col gap-4">
        {#each profile.experience as experience (`${experience.org}-${experience.role}`)}
          <div>
            <div class="flex items-baseline justify-between gap-3">
              <h3 class="text-sm font-medium">{experience.role} · <span class="text-muted-foreground">{experience.org}</span></h3>
              <span class="shrink-0 text-xs text-muted-foreground">{experience.period}</span>
            </div>
            <ul class="mt-1.5 list-disc space-y-1 pl-4">
              {#each experience.points as point (point)}
                <li class="text-xs text-muted-foreground">{point}</li>
              {/each}
            </ul>
          </div>
        {/each}
      </div>
    </section>

    <section class="mt-6">
      <h2 class="text-sm font-semibold tracking-tight">Projects</h2>
      <div class="mt-2.5 flex flex-col gap-3">
        {#each profile.projects as project (project.name)}
          <div class="rounded-lg border border-border bg-card/60 p-3">
            <h3 class="truncate text-sm font-medium">{project.name}</h3>
            <p class="mt-0.5 text-xs text-muted-foreground">{project.desc}</p>
            {#if project.url}
              <a href={project.url} target="_blank" rel="noreferrer noopener" class="mt-1.5 inline-flex items-center gap-1 text-xs text-primary hover:underline">
                {project.url.replace(/^https?:\/\//, "")} ↗
              </a>
            {/if}
          </div>
        {/each}
      </div>
    </section>
  </article>
</div>
