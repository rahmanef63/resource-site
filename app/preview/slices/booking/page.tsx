import { Booking } from "@/features/booking";

// Live preview: the request form + owner inbox on the in-memory mock store.
// Real backend: configureBooking({ mode:"live", submit, list, setStatus, canManage }).

export default function BookingPreview() {
  return (
    <div className="h-dvh w-full">
      <Booking />
    </div>
  );
}
