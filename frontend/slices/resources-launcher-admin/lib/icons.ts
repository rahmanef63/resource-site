// Launcher icons — lucide icon NAME → component map. A resource stores one of
// these names in `icon`; the admin select offers them and the launcher resolves
// the name to a component client-side. Unknown name falls back to Link. Keep
// tiny + generic (no brand glyphs — lucide dropped those anyway).
import {
  Link,
  Globe,
  Mail,
  FileText,
  Folder,
  Image as ImageIcon,
  Book,
  Calendar,
  Code2,
  Video,
  PenTool,
  Briefcase,
  type LucideIcon,
} from "lucide-react";

export const RESOURCE_ICONS: Record<string, LucideIcon> = {
  Link,
  Globe,
  Mail,
  FileText,
  Folder,
  Image: ImageIcon,
  Book,
  Calendar,
  Code: Code2,
  Video,
  Pen: PenTool,
  Work: Briefcase,
};

export const ICON_NAMES = Object.keys(RESOURCE_ICONS);

/** Resolve a stored icon NAME to a lucide component (Link fallback). */
export function resolveIcon(name: string): LucideIcon {
  return RESOURCE_ICONS[name] ?? Link;
}
