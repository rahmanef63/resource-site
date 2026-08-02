import { defineFeature } from "@/lib/shared/features/defineFeature";

export const calComBookingConfig = defineFeature({
  slug: "cal-com-booking",
  title: "Cal.com Booking",
  category: "data",
  routes: [{ path: "/book", view: () => import("./components/embed") }],
  nav: { label: "Book a call", group: "data", order: 0 },
});
