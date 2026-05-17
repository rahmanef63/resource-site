import {
  Columns2,
  Columns3,
  Monitor,
  RectangleHorizontal,
  RectangleVertical,
  Smartphone,
  Sparkles,
  Square,
  Tablet,
} from "lucide-react";
import type * as React from "react";
import type { PreviewView } from "@/lib/preview-presets";

export const VIEW_ICONS: Record<PreviewView, React.ComponentType<{ className?: string }>> = {
  mobile: Smartphone,
  "mobile-flip": RectangleHorizontal,
  "fold-cover": RectangleVertical,
  "fold-open": Square,
  "tri-fold-single": Smartphone,
  "tri-fold-dual": Columns2,
  "tri-fold-triple": Columns3,
  tablet: Tablet,
  desktop: Monitor,
  "iphone-fold-rumor": Sparkles,
};
