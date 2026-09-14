import { readonly, writable } from "svelte/store";
import type { Action } from "svelte/action";
import {
  observeInView,
  type InViewOptions,
} from "../../motion-kit/lib/core";

export function useInView(options: InViewOptions = {}) {
  const state = writable(false);
  const action: Action<HTMLElement> = (node) => {
    const destroy = observeInView(node, (visible) => state.set(visible), options);
    return { destroy };
  };
  return { action, inView: readonly(state) };
}
