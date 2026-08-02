export const fmtDate = (ts: number, locale = "en-US") =>
  new Date(ts).toLocaleDateString(locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export const fmtTime = (ts: number, locale = "en-US") =>
  new Date(ts).toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });
