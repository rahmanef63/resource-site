// Map raw fs errors to something actionable. Never mask the real cause — a
// blanket message hides genuine failures (body-size limits, permissions). Only
// translate known patterns; everything else passes through verbatim.
export const friendly = (msg: string) =>
  msg.includes("writable roots")
    ? "Folder is outside the writable area (OS_FS_WRITE_ROOTS)"
    : msg;
