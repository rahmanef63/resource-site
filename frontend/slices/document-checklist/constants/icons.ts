import type { ElementType } from "react"
import {
  FileText,
  GraduationCap,
  Briefcase,
  Wallet,
  Heart,
  Plane,
} from "lucide-react"

export const categoryIcons: Record<string, ElementType> = {
  identity: FileText,
  education: GraduationCap,
  professional: Briefcase,
  financial: Wallet,
  health: Heart,
  travel: Plane,
}
