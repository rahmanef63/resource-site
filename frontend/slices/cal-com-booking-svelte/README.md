# cal-com-booking — Svelte 5 / SvelteKit

Native Svelte 5 distribution for Cal.com inline booking. It loads the vanilla embed script on mount and removes the mounted DOM on destroy.

```svelte
<script lang="ts">
  import { CalEmbed } from "@/features/cal-com-booking";
</script>

<CalEmbed calLink="team/event-type" />
```

`calOrigin` defaults to `https://app.cal.com`; override it for regional or self-hosted Cal installations. An omitted `calLink` renders an explicit wiring notice instead of a fake account.

The same install includes the canonical bookings webhook mirror and shared embed/tool adapters. The bundled backend mirrors webhook events into `bookings`; tool operations `list/cancel/reschedule` still require host adapters.
