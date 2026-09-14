import {
  LayoutGrid,
  Code,
  Globe,
  Image,
  Music,
  Gauge,
  Folder,
  Cloud,
  Box,
  type LucideIcon,
} from "lucide-react";
import { GLYPH_KEYS } from "./glyph-core";

const MAP: Record<string, LucideIcon> = {
  grid: LayoutGrid,
  code: Code,
  globe: Globe,
  image: Image,
  music: Music,
  gauge: Gauge,
  folder: Folder,
  cloud: Cloud,
};

export { GLYPH_KEYS } from "./glyph-core";

export function glyphIcon(key: string): LucideIcon {
  return MAP[key] ?? Box;
}
