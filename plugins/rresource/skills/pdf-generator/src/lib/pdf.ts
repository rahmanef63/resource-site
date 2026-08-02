// Vendored in plugins/rresource. Self-contained — no cross-slice imports.
// Default state = localStorage. Optional Convex schema + fns under ./convex/.

import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export type PdfOptions = {
  filename?: string;
  format?: "a4" | "letter";
  orientation?: "portrait" | "landscape";
  scale?: number;
};

export async function generatePdfFromElement(
  el: HTMLElement,
  opts: PdfOptions = {},
): Promise<void> {
  const { filename = "document.pdf", format = "a4", orientation = "portrait", scale = 2 } = opts;
  const canvas = await html2canvas(el, { scale, useCORS: true, backgroundColor: "#ffffff" });
  const img = canvas.toDataURL("image/png");
  const pdf = new jsPDF({ orientation, unit: "mm", format });
  const w = pdf.internal.pageSize.getWidth();
  const h = (canvas.height * w) / canvas.width;
  pdf.addImage(img, "PNG", 0, 0, w, h, undefined, "FAST");
  pdf.save(filename);
}
