// Framework-neutral agentic tool collection. Hosts may register this plain
// structural collection with their own agent runtime; no React runtime or
// shared agentic package is required to install or author the collection.

export type MediaViewerCtx = {
  current: () => { name: string; kind: string; meta?: string };
  count: () => number;
  go: (delta: number) => void;
  zoom: () => number;
  setZoom: (zoom: number) => void;
};

type ToolParams = {
  type: "object";
  properties: Record<string, unknown>;
  required: string[];
  additionalProperties: false;
};

const noArgs: ToolParams = {
  type: "object",
  properties: {},
  required: [],
  additionalProperties: false,
};

const zoomArgs: ToolParams = {
  type: "object",
  properties: {
    z: {
      type: "number",
      description: "zoom factor",
      minimum: 0.4,
      maximum: 3,
    },
  },
  required: ["z"],
  additionalProperties: false,
};

const info = (ctx: MediaViewerCtx): string => {
  const file = ctx.current();
  return `viewing "${file.name}" (${file.kind}${file.meta ? `, ${file.meta}` : ""}) | zoom ${ctx.zoom().toFixed(2)}x | ${ctx.count()} files`;
};

export const mediaViewerTools = {
  namespace: "media-viewer",
  instructions:
    "Quick-look media viewer. info reads the current item; next/prev navigate; zoom.set is clamped, so read info to know position.",
  describe: info,
  tools: [
    {
      name: "info",
      description: "Read the current file, zoom and file count.",
      parameters: noArgs,
      run: (ctx: MediaViewerCtx) => info(ctx),
    },
    {
      name: "next",
      description: "Show the next file (wraps around).",
      parameters: noArgs,
      run: (ctx: MediaViewerCtx) => {
        ctx.go(1);
        return `now: ${ctx.current().name}`;
      },
    },
    {
      name: "prev",
      description: "Show the previous file (wraps around).",
      parameters: noArgs,
      run: (ctx: MediaViewerCtx) => {
        ctx.go(-1);
        return `now: ${ctx.current().name}`;
      },
    },
    {
      name: "zoom.set",
      description: "Set the zoom factor (0.4–3; 1 = fit).",
      parameters: zoomArgs,
      run: (ctx: MediaViewerCtx, args: Record<string, unknown>) => {
        ctx.setZoom(Number(args.z));
        return `zoom ${ctx.zoom().toFixed(2)}x`;
      },
    },
  ],
};
