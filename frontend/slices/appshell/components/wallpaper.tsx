"use client";

import { useShellAppearance } from "../registry/capabilities";

export function Wallpaper() {
  const { wallpaper } = useShellAppearance();
  return <div className={`wp-${wallpaper} absolute inset-0 z-0 transition-[background] duration-700`} />;
}
