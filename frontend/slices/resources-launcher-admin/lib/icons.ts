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
import { RESOURCE_ICON_NAMES } from "./core";

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

export const ICON_NAMES = [...RESOURCE_ICON_NAMES];

export function resolveIcon(name: string): LucideIcon {
  return RESOURCE_ICONS[name] ?? Link;
}
