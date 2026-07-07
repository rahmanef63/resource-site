"use client";

// macOS window controls. Glyphs fade in on hover of the cluster (os-rr).
// An unfocused window shows all three lights as flat grey (--tl-idle token,
// real macOS behavior); symbols and hover behavior are unchanged. The green
// light's click is forwarded as a real MouseEvent (the other two ignore the
// extra arg) so the caller can branch on Option-click — real macOS falls back
// to plain Zoom/maximize on Option, Full Screen otherwise.
export function TrafficLights({
  onClose,
  onMinimize,
  onMaximize,
  focused = true,
}: {
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: (e: React.MouseEvent) => void;
  focused?: boolean;
}) {
  return (
    <div className="group/lights flex gap-2">
      <Light label="Close window" color="#ff5f57" stroke="#7a0a00" focused={focused} onClick={onClose}>
        <path d="M1.6 1.6l4.8 4.8M6.4 1.6l-4.8 4.8" strokeWidth="1.2" strokeLinecap="round" />
      </Light>
      <Light label="Minimize window" color="#febc2e" stroke="#7a4b00" focused={focused} onClick={onMinimize}>
        <path d="M1.4 4h5.2" strokeWidth="1.4" strokeLinecap="round" />
      </Light>
      {/* Real macOS Full Screen glyph: two opposing filled triangles pointing
          outward toward the window's corners (the old single diagonal arrow
          was the plain-Zoom glyph — wrong action for what a plain click now
          does). The Light wrapper already fades the whole <svg> in on hover,
          so no separate hover state is needed here. */}
      <Light label="Full Screen" color="#28c840" stroke="#0a5200" focused={focused} onClick={onMaximize}>
        <path d="M1 1.2L3.4 1.2 1 3.6z" fill="#0a5200" stroke="none" />
        <path d="M7 6.8L4.6 6.8 7 4.4z" fill="#0a5200" stroke="none" />
      </Light>
    </div>
  );
}

function Light({
  label,
  color,
  stroke,
  focused,
  onClick,
  children,
}: {
  label: string;
  color: string;
  stroke: string;
  focused: boolean;
  onClick: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}) {
  return (
    <button
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
      onPointerDown={(e) => e.stopPropagation()}
      className="grid size-3 place-items-center rounded-full shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.18)]"
      style={{ background: focused ? color : "var(--tl-idle, #d1d1d6)" }}
    >
      <svg
        viewBox="0 0 8 8"
        className="size-2 opacity-0 group-hover/lights:opacity-60"
        stroke={stroke}
      >
        {children}
      </svg>
    </button>
  );
}
