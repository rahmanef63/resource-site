// Slice config (rr: frontend.configExport = "bookingConfig").
export type BookingConfig = {
  /** Registry identity — MUST equal slice.json slug/title/category. */
  slug: string;
  title: string;
  category: "os";
};

export const bookingConfig: BookingConfig = {
  slug: "booking",
  title: "Booking — session request form + owner inbox",
  category: "os",
};

export default bookingConfig;
