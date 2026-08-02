// Agentic tool collection. The picker is props-driven (R3): search runs the
// host's injected Unsplash action, pick forwards to the host's onChange.

import { defineToolCollection, obj, str } from "@/shared/agentic";

export type ImagePickerCtx = {
  /** Host's Unsplash search action — resolves to rendered hit lines (id + url). */
  search: (query: string) => Promise<string>;
  /** Apply an ImageValue (url:<href>, css:<gradient>, unsplash:<id>…). */
  pick: (value: string) => void;
};

export const imagePickerTools = defineToolCollection<ImagePickerCtx>({
  namespace: "image-picker",
  instructions: "Image chooser. search a provider, then pick a result; pick selects an image, it does not upload.",
  tools: [
    {
      name: "search",
      description: "Search Unsplash for images (via the host's injected action).",
      parameters: obj({ "query!": str("search text") }),
      run: (ctx, a) => ctx.search(a.query as string),
    },
    {
      name: "pick",
      description: "Pick an image value (url:…, css:…, or an Unsplash result value).",
      parameters: obj({ "value!": str("ImageValue string") }),
      run: (ctx, a) => {
        ctx.pick(a.value as string);
        return `picked ${a.value}`;
      },
    },
  ],
});
