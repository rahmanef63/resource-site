import { Monitor, Smartphone, Tablet, type LucideIcon } from "lucide-react";
import type { Device } from "./core";

export const DEVICE_ICON: Record<Device, LucideIcon> = {
  full: Monitor,
  tablet: Tablet,
  phone: Smartphone,
};
