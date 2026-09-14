import type {
  EmblaCarouselType,
  EmblaOptionsType,
  EmblaPluginType,
} from "embla-carousel";
import { getContext, setContext } from "svelte";
import { writable, type Writable } from "svelte/store";

export type CarouselApi = EmblaCarouselType;
export type CarouselOptions = EmblaOptionsType;
export type CarouselPlugin = EmblaPluginType;
export type CarouselOrientation = "horizontal" | "vertical";

type Snapshot = { canScrollPrev: boolean; canScrollNext: boolean };
export type CarouselContext = {
  orientation: () => CarouselOrientation;
  opts: () => CarouselOptions | undefined;
  plugins: () => CarouselPlugin[];
  snapshot: Writable<Snapshot>;
  connect: (api: CarouselApi) => () => void;
  scrollPrev: () => void;
  scrollNext: () => void;
};

const KEY = Symbol("motion-kit-carousel");

export function createCarouselContext(input: {
  orientation: () => CarouselOrientation;
  opts: () => CarouselOptions | undefined;
  plugins: () => CarouselPlugin[];
  setApi: () => ((api: CarouselApi) => void) | undefined;
}): CarouselContext {
  let api: CarouselApi | undefined;
  const snapshot = writable<Snapshot>({ canScrollPrev: false, canScrollNext: false });
  const sync = () => snapshot.set({
    canScrollPrev: api?.canScrollPrev() ?? false,
    canScrollNext: api?.canScrollNext() ?? false,
  });
  return {
    orientation: input.orientation,
    opts: input.opts,
    plugins: input.plugins,
    snapshot,
    connect(nextApi) {
      api = nextApi;
      input.setApi()?.(nextApi);
      sync();
      nextApi.on("select", sync);
      nextApi.on("reInit", sync);
      return () => {
        nextApi.off("select", sync);
        nextApi.off("reInit", sync);
        if (api === nextApi) api = undefined;
      };
    },
    scrollPrev: () => api?.scrollPrev(),
    scrollNext: () => api?.scrollNext(),
  };
}

export function setCarouselContext(context: CarouselContext) {
  setContext(KEY, context);
}

export function getCarouselContext(): CarouselContext {
  const context = getContext<CarouselContext | undefined>(KEY);
  if (!context) throw new Error("Carousel component must be used inside <Carousel>.");
  return context;
}
