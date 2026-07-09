"use client";
// glass-desktop — clock-analog (time family, S square). An analog face: 12 tick
// marks plus hour/minute/second hands, each a CSS `rotate()` container driven off
// the shared 1 Hz clock (never its own interval). Hands sit at 12 o'clock until
// the client mounts, so server and first paint agree (no hydration mismatch).
// Content only — the canvas supplies the glass shell.
import { useClock } from "@/features/glass-desktop/hooks/use-clock";
import { useMounted } from "@/features/glass-desktop/hooks/use-mounted";
import { clockAnalogSeed } from "@/features/glass-desktop/lib/seeds/time-2.seed";
import type { WidgetProps } from "@/features/glass-desktop/types";

const { hour, minute, second, tickCount } = clockAnalogSeed;

export function ClockAnalog(_props: WidgetProps) {
  const now = useClock("second");
  const mounted = useMounted();
  const sec = mounted ? now.getSeconds() : 0;
  const min = mounted ? now.getMinutes() : 0;
  const hr = mounted ? now.getHours() % 12 : 0;

  const hands = [
    { key: "h", deg: hr * 30 + min * 0.5, len: hour.len, width: hour.width, color: "var(--color-ink-hi)" },
    { key: "m", deg: min * 6 + sec * 0.1, len: minute.len, width: minute.width, color: "var(--color-ink-hi)" },
    { key: "s", deg: sec * 6, len: second.len, width: second.width, color: "var(--color-accent-amber)" },
  ];

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="relative aspect-square h-full max-h-full">
        {Array.from({ length: tickCount }, (_, i) => (
          <div key={`t${i}`} className="absolute inset-0" style={{ transform: `rotate(${i * 30}deg)` }}>
            <div
              className="absolute left-1/2"
              style={{
                top: "6%",
                width: i % 3 === 0 ? 3 : 2,
                height: i % 3 === 0 ? "10%" : "6%",
                transform: "translateX(-50%)",
                background: i % 3 === 0 ? "var(--color-ink-mid)" : "var(--color-hairline)",
                borderRadius: "var(--radius-pill)",
              }}
            />
          </div>
        ))}

        {hands.map((h) => (
          <div
            key={h.key}
            className="absolute inset-0"
            style={{ transform: `rotate(${h.deg}deg)`, transition: "transform var(--duration-micro) linear" }}
            suppressHydrationWarning
          >
            <div
              className="absolute left-1/2"
              style={{
                bottom: "50%",
                width: h.width,
                height: `${h.len}%`,
                transform: "translateX(-50%)",
                background: h.color,
                borderRadius: "var(--radius-pill)",
              }}
            />
          </div>
        ))}

        <div
          className="absolute left-1/2 top-1/2"
          style={{
            width: 8,
            height: 8,
            transform: "translate(-50%,-50%)",
            borderRadius: "9999px",
            background: "var(--color-accent-amber)",
          }}
        />
      </div>
    </div>
  );
}
