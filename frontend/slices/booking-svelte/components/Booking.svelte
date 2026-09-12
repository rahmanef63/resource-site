<script lang="ts">
  import { bookingApi, type BookingRow } from "../lib/host";
  import { isBookingDraftValid, normalizeBookingRequest } from "../lib/request";

  let api = $derived($bookingApi);
  let rows = $state<BookingRow[]>([]);
  let canSee = $state(false);
  let name = $state("");
  let email = $state("");
  let topic = $state("");
  let preferredTime = $state("");
  let note = $state("");
  let busy = $state(false);
  let sent = $state(false);
  let error = $state("");
  let valid = $derived(isBookingDraftValid({ name, email, topic }));

  $effect(() => {
    $bookingApi;
    void reload();
  });

  async function reload() {
    error = "";
    if (!api.hasInbox) {
      canSee = false;
      rows = [];
      return;
    }
    try {
      const allowed = await api.canManage();
      canSee = allowed;
      rows = allowed ? await api.list() : [];
    } catch {
      canSee = false;
      rows = [];
      error = "Could not load booking requests.";
    }
  }

  async function submit() {
    if (!valid || busy) return;
    busy = true;
    error = "";
    try {
      await api.submit(normalizeBookingRequest({ name, email, topic, preferredTime, note }));
      sent = true;
      name = "";
      email = "";
      topic = "";
      preferredTime = "";
      note = "";
      await reload();
    } catch {
      error = "Could not send the request. Try again.";
    } finally {
      busy = false;
    }
  }

  async function setStatus(id: string, status: "confirmed" | "declined") {
    error = "";
    try {
      await api.setStatus(id, status);
      await reload();
    } catch {
      error = "Could not update the request.";
    }
  }
</script>

<div class="h-full overflow-auto bg-background text-foreground">
  <div class="p-5">
    {#if canSee}
      <section class="mb-6" aria-labelledby="booking-inbox-heading">
        <h2 id="booking-inbox-heading" class="mb-2 text-sm font-semibold">Requests ({rows.length})</h2>
        <div class="rounded-xl border border-border bg-card p-2">
          {#if rows.length === 0}
            <p class="p-3 text-sm text-muted-foreground">No requests yet.</p>
          {:else}
            <ul class="divide-y divide-border">
              {#each rows as row (row.id)}
                <li class="flex flex-wrap items-center gap-2 py-2.5">
                  <div class="min-w-[180px] flex-1">
                    <p class="text-sm font-medium">
                      {row.name} · <span class="text-muted-foreground">{row.topic}</span>
                    </p>
                    <p class="text-xs text-muted-foreground">
                      {row.email}{row.preferredTime ? ` · ${row.preferredTime}` : ""}{row.note ? ` — ${row.note}` : ""}
                    </p>
                  </div>
                  <span class="rounded bg-muted px-1.5 py-0.5 text-[10px] capitalize text-muted-foreground">
                    {row.status}
                  </span>
                  <div class="flex items-center gap-1">
                    <button
                      type="button"
                      class="h-8 rounded-md px-2 text-sm font-medium hover:bg-accent"
                      aria-label={`Confirm request from ${row.name}`}
                      onclick={() => void setStatus(row.id, "confirmed")}
                    >Confirm</button>
                    <button
                      type="button"
                      class="h-8 rounded-md px-2 text-sm font-medium text-destructive hover:bg-accent"
                      aria-label={`Decline request from ${row.name}`}
                      onclick={() => void setStatus(row.id, "declined")}
                    >Decline</button>
                  </div>
                </li>
              {/each}
            </ul>
          {/if}
        </div>
      </section>
    {/if}

    <section aria-labelledby="booking-form-heading">
      <div class="mb-3">
        <h2 id="booking-form-heading" class="text-base font-semibold">Book a session</h2>
        <p class="text-xs text-muted-foreground">Fill the form — we will reach back out.</p>
      </div>

      {#if error}
        <p class="mb-3 max-w-md rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive" role="alert">
          {error}
        </p>
      {/if}

      {#if sent}
        <div class="max-w-md rounded-lg border border-border bg-card p-4 text-sm" role="status">
          <p class="font-medium">Request sent</p>
          <p class="mt-1 text-muted-foreground">Thanks — you will hear back soon.</p>
          <button type="button" class="mt-3 rounded-md border border-input px-3 py-1.5 text-sm font-medium" onclick={() => (sent = false)}>
            Send another
          </button>
        </div>
      {:else}
        <form class="grid max-w-md gap-2" onsubmit={(event) => { event.preventDefault(); void submit(); }}>
          <label class="grid gap-1 text-sm">
            <span class="sr-only">Name</span>
            <input class="h-9 rounded-md border border-input bg-background px-3" bind:value={name} placeholder="Name" autocomplete="name" required />
          </label>
          <label class="grid gap-1 text-sm">
            <span class="sr-only">Email</span>
            <input class="h-9 rounded-md border border-input bg-background px-3" bind:value={email} placeholder="Email" type="email" autocomplete="email" required />
          </label>
          <label class="grid gap-1 text-sm">
            <span class="sr-only">Topic</span>
            <input class="h-9 rounded-md border border-input bg-background px-3" bind:value={topic} placeholder="Topic / what you need" required />
          </label>
          <label class="grid gap-1 text-sm">
            <span class="sr-only">Preferred time</span>
            <input class="h-9 rounded-md border border-input bg-background px-3" bind:value={preferredTime} placeholder="Preferred time (optional, e.g. weekday evenings)" />
          </label>
          <label class="grid gap-1 text-sm">
            <span class="sr-only">Notes</span>
            <textarea class="min-h-20 resize-none rounded-md border border-input bg-background px-3 py-2" bind:value={note} placeholder="Notes (optional)" rows="3"></textarea>
          </label>
          <button
            type="submit"
            class="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:pointer-events-none disabled:opacity-50"
            disabled={busy || !valid}
          >{busy ? "Sending…" : "Send request"}</button>
        </form>
      {/if}
    </section>
  </div>
</div>
