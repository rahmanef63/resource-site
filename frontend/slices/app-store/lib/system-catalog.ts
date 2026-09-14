import {
  Folder,
  Globe,
  Code,
  Terminal,
  Image,
  Clapperboard,
  Eye,
  Store,
  PlusSquare,
  Gauge,
  Sparkles,
  Settings,
  Search,
  PanelRight,
  Bell,
  SlidersHorizontal,
  LayoutGrid,
  type LucideIcon,
} from "lucide-react";
import { SYSTEM_CATALOG_CORE, type SystemEntryCore, type SystemKind } from "./system-catalog-core";

const ICONS: Record<string, LucideIcon> = {
  folder: Folder,
  globe: Globe,
  code: Code,
  terminal: Terminal,
  image: Image,
  video: Clapperboard,
  eye: Eye,
  store: Store,
  plus: PlusSquare,
  gauge: Gauge,
  sparkles: Sparkles,
  settings: Settings,
  search: Search,
  panel: PanelRight,
  bell: Bell,
  sliders: SlidersHorizontal,
  grid: LayoutGrid,
};

export type SystemEntry = Omit<SystemEntryCore, "glyph"> & { icon: LucideIcon };
export type { SystemKind } from "./system-catalog-core";

export const SYSTEM_CATALOG: SystemEntry[] = SYSTEM_CATALOG_CORE.map(({ glyph, ...entry }) => ({
  ...entry,
  icon: ICONS[glyph] ?? LayoutGrid,
}));
