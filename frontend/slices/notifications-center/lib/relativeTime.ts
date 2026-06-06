/** Format an ISO timestamp relative to a reference `now` (also ISO/Date).
 *  Pure + deterministic — pass a fixed `now` for stable previews/SSR. */
export function relativeTime(iso: string, now: string | Date = new Date()): string {
  const then = Date.parse(iso);
  const ref = typeof now === "string" ? Date.parse(now) : now.getTime();
  if (Number.isNaN(then) || Number.isNaN(ref)) return "";

  const diffSec = Math.round((ref - then) / 1000);
  const future = diffSec < 0;
  const s = Math.abs(diffSec);

  const units: [number, string][] = [
    [60, "s"],
    [3600, "m"],
    [86_400, "h"],
    [604_800, "d"],
    [2_629_746, "w"],
    [31_556_952, "mo"],
    [Infinity, "y"],
  ];

  let value = s;
  let label = "s";
  let prev = 1;
  for (const [limit, unit] of units) {
    if (s < limit) {
      value = Math.max(1, Math.floor(s / prev));
      label = unit;
      break;
    }
    prev = limit;
  }
  if (s < 5) return "now";
  return future ? `in ${value}${label}` : `${value}${label} ago`;
}
