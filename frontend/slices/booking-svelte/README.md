# booking — Svelte 5 / SvelteKit

Svelte distribution of the booking slice: one public session-request form plus the optional owner inbox in the same component.

```bash
npx rr add booking --framework sveltekit
# alias: --framework svelte
```

```svelte
<script lang="ts">
  import { Booking, configureBooking } from "@/features/booking";

  configureBooking({
    mode: "live",
    submit: (request) => api.createBooking(request),
    list: () => api.listBookings(),
    setStatus: (id, status) => api.setBookingStatus(id, status),
    canManage: () => api.isOwner(),
  });
</script>

<Booking />
```

The `BookingAdapter` contract matches the canonical distribution. Omit `list` and `canManage` to expose only the public write form. Runtime adapter replacement is reactive through a stable subscribable `bookingApi`.

The Svelte distribution uses native form controls and inline behavior rather than React, `lucide-react`, or React shadcn components. `svelte@^5` is scoped to the Svelte framework descriptor; React/Next remains the default distribution.
