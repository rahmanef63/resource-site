# booking — session request form + owner inbox

One app, two modes: a public "book a session" request form, and the owner's
triage inbox (shown when the viewer can manage). Visitors submit
name / email / topic (+ optional preferred time / note); the owner confirms or
declines pending requests.

## Mount

```tsx
import { Booking } from "@/features/booking";

// Zero wiring → in-memory mock store (form + inbox both interactive)
<Booking />
```

Or hand `bookingApp` (lazy `load`) to an appshell-style launcher.

## Host seam (`lib/host.ts`)

```ts
import { configureBooking } from "@/features/booking";

configureBooking({
  mode: "live",
  submit: (req) => myApi.createBooking(req), // public write
  list: () => myApi.listBookings(), // owner inbox (omit to hide)
  setStatus: (id, status) => myApi.setStatus(id, status),
  canManage: () => myApi.isOwner(),
});
```

Every other file in the slice imports ONLY this seam. Omit `list` / `canManage`
for a write-only public form with no inbox.
