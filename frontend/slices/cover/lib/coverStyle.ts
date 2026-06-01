/** Build the CSS for a cover. Image covers apply a vertical focal point via
 *  background-position; colour/gradient covers go straight into `background`.
 *  `resolvedUrl` is the host-resolved URL for upload (FileRef) covers. */

import type { CSSProperties } from "react";
import type { CoverData } from "../types";
import { isImageCover } from "./parseCover";

export function coverStyle(cover: CoverData, resolvedUrl?: string | null): CSSProperties {
  const posY = cover.positionY ?? 50;
  if (isImageCover(cover)) {
    const url = resolvedUrl ?? cover.value;
    return {
      backgroundImage: `url("${url}")`,
      backgroundSize: "cover",
      backgroundPosition: `center ${posY}%`,
      backgroundRepeat: "no-repeat",
    };
  }
  return { background: cover.value };
}
