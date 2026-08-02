import {
  Info,
  Image as ImageIcon,
  FileText,
  Link,
  Calendar,
  Lock,
  Users,
} from "lucide-react";
import type { MemberInfoNavItem, MemberInfoSection } from "./types";

export const MEMBER_INFO_SECTIONS: MemberInfoNavItem[] = [
  { id: "overview", icon: Info, label: "Overview" },
  { id: "media", icon: ImageIcon, label: "Media" },
  { id: "files", icon: FileText, label: "Files" },
  { id: "links", icon: Link, label: "Links" },
  { id: "events", icon: Calendar, label: "Events" },
  { id: "encryption", icon: Lock, label: "Encryption" },
  { id: "groups", icon: Users, label: "Groups" },
];

export const DEFAULT_MEMBER_INFO_SECTION: MemberInfoSection = "overview";
